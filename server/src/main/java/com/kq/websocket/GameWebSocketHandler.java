package com.kq.websocket;

import com.kq.message.GameMessage;
import com.kq.message.GameMessageSerializer;
import com.kq.message.MessageType;
import com.kq.session.GameSessionManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class GameWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(GameWebSocketHandler.class);

    private final GameSessionManager sessionManager;

    public GameWebSocketHandler(GameSessionManager sessionManager) {
        this.sessionManager = sessionManager;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        Map<String, String> params = parseQueryParams(session);
        String roomCode = params.get("roomCode");
        String playerId = params.get("playerId");
        log.info("WebSocket connected: playerId={}, roomCode={}", playerId, roomCode);

        session.getAttributes().put("playerId", playerId != null ? playerId : "");
        session.getAttributes().put("roomCode", roomCode != null ? roomCode : "");
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String playerId = (String) session.getAttributes().get("playerId");
        String roomCode = (String) session.getAttributes().get("roomCode");

        GameMessage gameMessage = GameMessageSerializer.deserialize(message.getPayload());

        if (gameMessage.type() == MessageType.CREATE_GAME) {
            sessionManager.handleMessage(null, playerId, gameMessage, session);
            return;
        }

        if (gameMessage.type() == MessageType.JOIN_GAME) {
            String joinRoomCode = gameMessage.payload().has("roomCode")
                    ? gameMessage.payload().get("roomCode").asText() : null;
            if (joinRoomCode != null) {
                session.getAttributes().put("roomCode", joinRoomCode);
            }
            sessionManager.handleMessage(joinRoomCode, playerId, gameMessage, session);
            return;
        }

        if (gameMessage.type() == MessageType.SELECT_ROLE) {
            sessionManager.handleMessage(roomCode, playerId, gameMessage, session);
            return;
        }

        sessionManager.handleMessage(roomCode, playerId, gameMessage, session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String playerId = (String) session.getAttributes().get("playerId");
        String roomCode = (String) session.getAttributes().get("roomCode");
        if (roomCode != null && !roomCode.isBlank() && playerId != null) {
            sessionManager.leaveSession(roomCode, playerId);
        }
        log.info("WebSocket closed: playerId={}, roomCode={}, status={}", playerId, roomCode, status);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.error("WebSocket transport error for session {}", session.getId(), exception);
    }

    private Map<String, String> parseQueryParams(WebSocketSession session) {
        Map<String, String> params = new LinkedHashMap<>();
        URI uri = session.getUri();
        if (uri == null || uri.getQuery() == null) {
            return params;
        }
        for (String param : uri.getQuery().split("&")) {
            String[] kv = param.split("=", 2);
            if (kv.length == 2) {
                params.put(kv[0], kv[1]);
            }
        }
        return params;
    }
}
