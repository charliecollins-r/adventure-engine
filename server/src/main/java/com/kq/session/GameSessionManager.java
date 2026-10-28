package com.kq.session;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.kq.message.GameMessage;
import com.kq.message.GameMessageSerializer;
import com.kq.message.MessageType;
import com.kq.model.PlayerState;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

@Component
public class GameSessionManager {

    private static final Logger log = LoggerFactory.getLogger(GameSessionManager.class);
    private static final int MAX_JOIN_ATTEMPTS_PER_MINUTE = 5;

    private final Map<String, GameSession> sessions = new ConcurrentHashMap<>();
    private final Map<String, ConcurrentLinkedDeque<Instant>> joinAttempts = new ConcurrentHashMap<>();

    public String createSession() {
        String roomCode;
        do {
            roomCode = RoomCodeGenerator.generate();
        } while (sessions.containsKey(roomCode));

        GameSession session = new GameSession(roomCode);
        sessions.put(roomCode, session);
        log.info("Created game session: {}", roomCode);
        return roomCode;
    }

    public boolean joinSession(String roomCode, String playerId, WebSocketSession wsSession) {
        GameSession session = sessions.get(roomCode);
        if (session == null) {
            return false;
        }
        return session.addPlayer(playerId, wsSession);
    }

    public void leaveSession(String roomCode, String playerId) {
        GameSession session = sessions.get(roomCode);
        if (session == null) {
            return;
        }
        session.removePlayer(playerId);
        log.info("Player {} left session {}", playerId, roomCode);
        if (session.isEmpty()) {
            sessions.remove(roomCode);
            log.info("Removed empty session: {}", roomCode);
        }
    }

    public void handleMessage(String roomCode, String playerId, GameMessage message, WebSocketSession wsSession) {
        try {
            switch (message.type()) {
                case CREATE_GAME -> handleCreateGame(wsSession);
                case JOIN_GAME -> handleJoinGame(message.payload(), playerId, wsSession);
                case SELECT_CHARACTER -> handleSelectCharacter(roomCode, playerId, message.payload());
                case PLAYER_MOVE -> handlePlayerMove(roomCode, playerId, message.payload());
                case PLAYER_INTERACT -> handlePlayerInteract(roomCode, playerId, message.payload());
                default -> sendError(wsSession, "Unsupported message type: " + message.type());
            }
        } catch (Exception e) {
            log.error("Error handling message {} from player {}", message.type(), playerId, e);
            sendError(wsSession, "Internal server error");
        }
    }

    private void handleCreateGame(WebSocketSession wsSession) {
        String roomCode = createSession();
        Map<String, Object> payload = Map.of("roomCode", roomCode);
        sendMessage(wsSession, MessageType.CREATE_GAME, payload);
    }

    private void handleJoinGame(JsonNode payload, String playerId, WebSocketSession wsSession) {
        String roomCode = payload.has("roomCode") ? payload.get("roomCode").asText() : null;
        if (roomCode == null || roomCode.isBlank()) {
            sendError(wsSession, "Room code is required");
            return;
        }

        String remoteAddr = remoteAddress(wsSession);
        if (isRateLimited(remoteAddr)) {
            sendError(wsSession, "Too many join attempts. Please wait.");
            return;
        }

        GameSession session = sessions.get(roomCode);
        if (session == null) {
            sendError(wsSession, "Game not found: " + roomCode);
            return;
        }

        if (!session.addPlayer(playerId, wsSession)) {
            sendError(wsSession, "Game is full");
            return;
        }

        log.info("Player {} joined session {}", playerId, roomCode);
        broadcastState(session);
    }

    private void handleSelectCharacter(String roomCode, String playerId, JsonNode payload) {
        GameSession session = sessions.get(roomCode);
        if (session == null) return;

        String characterId = payload.has("characterId") ? payload.get("characterId").asText() : null;
        if (characterId == null) return;

        if (session.selectCharacter(playerId, characterId)) {
            log.info("Player {} selected character {} in session {}", playerId, characterId, roomCode);
            broadcastState(session);
        } else {
            PlayerState player = session.getPlayers().get(playerId);
            if (player != null && player.getWebSocketSession() != null) {
                sendError(player.getWebSocketSession(), "Character not available: " + characterId);
            }
        }
    }

    private void handlePlayerMove(String roomCode, String playerId, JsonNode payload) {
        GameSession session = sessions.get(roomCode);
        if (session == null) return;

        PlayerState player = session.getPlayers().get(playerId);
        if (player == null) return;

        double x = payload.has("x") ? payload.get("x").asDouble() : player.getX();
        double y = payload.has("y") ? payload.get("y").asDouble() : player.getY();
        String animation = payload.has("animation") ? payload.get("animation").asText() : player.getCurrentAnimation();

        player.setX(x);
        player.setY(y);
        player.setCurrentAnimation(animation);

        broadcastState(session);
    }

    private void handlePlayerInteract(String roomCode, String playerId, JsonNode payload) {
        GameSession session = sessions.get(roomCode);
        if (session == null) return;

        String objectId = payload.has("objectId") ? payload.get("objectId").asText() : null;
        if (objectId == null) return;

        session.processInteraction(playerId, objectId);
        log.info("Player {} interacted with {} in session {}", playerId, objectId, roomCode);
        broadcastState(session);
    }

    private void broadcastState(GameSession session) {
        Map<String, Object> snapshot = session.getStateSnapshot();
        for (PlayerState player : session.getPlayers().values()) {
            WebSocketSession ws = player.getWebSocketSession();
            if (ws != null && ws.isOpen()) {
                sendMessage(ws, MessageType.GAME_STATE, snapshot);
            }
        }
    }

    private void sendMessage(WebSocketSession session, MessageType type, Object payload) {
        try {
            String json = GameMessageSerializer.serialize(type, payload);
            session.sendMessage(new TextMessage(json));
        } catch (IOException e) {
            log.error("Failed to send message to session {}", session.getId(), e);
        }
    }

    private void sendError(WebSocketSession session, String errorMessage) {
        sendMessage(session, MessageType.ERROR, Map.of("message", errorMessage));
    }

    private boolean isRateLimited(String remoteAddr) {
        ConcurrentLinkedDeque<Instant> attempts = joinAttempts.computeIfAbsent(remoteAddr, k -> new ConcurrentLinkedDeque<>());
        Instant oneMinuteAgo = Instant.now().minusSeconds(60);
        attempts.removeIf(t -> t.isBefore(oneMinuteAgo));
        if (attempts.size() >= MAX_JOIN_ATTEMPTS_PER_MINUTE) {
            return true;
        }
        attempts.add(Instant.now());
        return false;
    }

    private String remoteAddress(WebSocketSession session) {
        try {
            if (session.getRemoteAddress() != null) {
                return session.getRemoteAddress().getAddress().getHostAddress();
            }
        } catch (Exception ignored) {}
        return "unknown";
    }

    public GameSession getSession(String roomCode) {
        return sessions.get(roomCode);
    }
}
