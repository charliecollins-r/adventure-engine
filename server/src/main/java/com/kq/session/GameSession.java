package com.kq.session;

import com.kq.model.CharacterProfile;
import com.kq.model.GameState;
import com.kq.model.PlayerState;
import com.kq.model.SceneObject;
import org.springframework.web.socket.WebSocketSession;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class GameSession {

    private static final int MAX_PLAYERS = 2;

    private final String roomCode;
    private final UUID sessionId;
    private final Map<String, PlayerState> players = new ConcurrentHashMap<>();
    private final GameState gameState;
    private final Instant createdAt;

    public GameSession(String roomCode) {
        this.roomCode = roomCode;
        this.sessionId = UUID.randomUUID();
        this.gameState = new GameState();
        this.createdAt = Instant.now();
        initializeDefaultScene();
    }

    private void initializeDefaultScene() {
        gameState.addSceneObject(new SceneObject("key", "item", 600, 350, true, "default", true));
        gameState.addSceneObject(new SceneObject("chest", "interactive", 200, 250, true, "locked", false));
        gameState.addSceneObject(new SceneObject("painting", "scenery", 400, 150, true, "default", false));
    }

    public synchronized boolean addPlayer(String playerId, WebSocketSession session) {
        if (players.size() >= MAX_PLAYERS && !players.containsKey(playerId)) {
            return false;
        }
        PlayerState existing = players.get(playerId);
        if (existing != null) {
            existing.setConnected(true);
            existing.setWebSocketSession(session);
            return true;
        }
        PlayerState player = new PlayerState(playerId);
        player.setWebSocketSession(session);
        players.put(playerId, player);
        return true;
    }

    public synchronized void removePlayer(String playerId) {
        PlayerState player = players.get(playerId);
        if (player != null) {
            player.setConnected(false);
            player.setWebSocketSession(null);
        }
    }

    public synchronized boolean selectCharacter(String playerId, String characterId) {
        if (CharacterProfile.findById(characterId) == null) {
            return false;
        }
        boolean taken = players.values().stream()
                .anyMatch(p -> characterId.equals(p.getCharacterId()) && !p.getPlayerId().equals(playerId));
        if (taken) {
            return false;
        }
        PlayerState player = players.get(playerId);
        if (player == null) {
            return false;
        }
        player.setCharacterId(characterId);
        return true;
    }

    public List<CharacterProfile> getAvailableCharacters() {
        Set<String> taken = new HashSet<>();
        players.values().forEach(p -> {
            if (p.getCharacterId() != null) {
                taken.add(p.getCharacterId());
            }
        });
        return CharacterProfile.ALL.stream()
                .filter(c -> !taken.contains(c.id()))
                .toList();
    }

    public synchronized void processInteraction(String playerId, String objectId) {
        SceneObject obj = gameState.getSceneObject(objectId);
        if (obj == null || !obj.isVisible()) {
            return;
        }
        if (obj.isCollectible()) {
            gameState.addItem(objectId);
            obj.setVisible(false);
            return;
        }
        if ("chest".equals(objectId) && "locked".equals(obj.getState()) && gameState.hasItem("key")) {
            obj.setState("open");
            gameState.removeItem("key");
            gameState.getPuzzleStates().put("chest_opened", "true");
        }
    }

    public Map<String, Object> getStateSnapshot() {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("roomCode", roomCode);
        snapshot.put("currentScene", gameState.getCurrentScene());
        snapshot.put("players", players.values().stream()
                .map(p -> {
                    Map<String, Object> pm = new LinkedHashMap<>();
                    pm.put("playerId", p.getPlayerId());
                    pm.put("characterId", p.getCharacterId());
                    pm.put("x", p.getX());
                    pm.put("y", p.getY());
                    pm.put("currentAnimation", p.getCurrentAnimation());
                    pm.put("connected", p.isConnected());
                    return pm;
                })
                .toList());
        snapshot.put("inventory", gameState.getInventory());
        snapshot.put("sceneObjects", gameState.getSceneObjects().values().stream()
                .map(o -> {
                    Map<String, Object> om = new LinkedHashMap<>();
                    om.put("id", o.getId());
                    om.put("type", o.getType());
                    om.put("x", o.getX());
                    om.put("y", o.getY());
                    om.put("visible", o.isVisible());
                    om.put("state", o.getState());
                    om.put("collectible", o.isCollectible());
                    return om;
                })
                .toList());
        snapshot.put("puzzleStates", gameState.getPuzzleStates());
        snapshot.put("availableCharacters", getAvailableCharacters());
        return snapshot;
    }

    public String getRoomCode() { return roomCode; }
    public UUID getSessionId() { return sessionId; }
    public Map<String, PlayerState> getPlayers() { return players; }
    public GameState getGameState() { return gameState; }
    public Instant getCreatedAt() { return createdAt; }

    public boolean isEmpty() {
        return players.values().stream().noneMatch(PlayerState::isConnected);
    }
}
