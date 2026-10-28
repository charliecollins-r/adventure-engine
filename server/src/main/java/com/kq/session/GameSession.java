package com.kq.session;

import com.kq.model.GameState;
import com.kq.model.InteractionResult;
import com.kq.model.PlayerState;
import com.kq.model.Role;
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
        initializeRooms();
    }

    private void initializeRooms() {
        // Captive room objects (upstairs bedroom)
        gameState.addCaptiveRoomObject(new SceneObject("bed", "interactive", 350, 400, true, "default", false));
        gameState.addCaptiveRoomObject(new SceneObject("floorboard", "interactive", 500, 500, true, "intact", false));
        gameState.addCaptiveRoomObject(new SceneObject("window", "interactive", 700, 200, true, "locked", false));
        gameState.addCaptiveRoomObject(new SceneObject("closet", "interactive", 150, 300, true, "closed", false));
        gameState.addCaptiveRoomObject(new SceneObject("bucket", "item", 600, 450, true, "default", true));
        gameState.addCaptiveRoomObject(new SceneObject("heating_pipe", "interactive", 800, 350, true, "default", false));
        gameState.addCaptiveRoomObject(new SceneObject("door", "interactive", 50, 350, true, "locked", false));

        // Killer room objects (downstairs hideout)
        gameState.addKillerRoomObject(new SceneObject("security_monitors", "interactive", 400, 250, true, "active", false));
        gameState.addKillerRoomObject(new SceneObject("workbench", "interactive", 600, 400, true, "default", false));
        gameState.addKillerRoomObject(new SceneObject("front_door", "interactive", 50, 350, true, "closed", false));
        gameState.addKillerRoomObject(new SceneObject("phone", "interactive", 300, 300, true, "idle", false));
        gameState.addKillerRoomObject(new SceneObject("light_switch", "interactive", 100, 250, true, "on", false));
        gameState.addKillerRoomObject(new SceneObject("stairs", "interactive", 800, 350, true, "default", false));
        gameState.addKillerRoomObject(new SceneObject("wall_compartment", "interactive", 700, 200, true, "closed", false));
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

    public synchronized boolean selectRole(String playerId, String roleId) {
        if (Role.findById(roleId) == null) {
            return false;
        }
        boolean taken = players.values().stream()
                .anyMatch(p -> roleId.equals(p.getRoleId()) && !p.getPlayerId().equals(playerId));
        if (taken) {
            return false;
        }
        PlayerState player = players.get(playerId);
        if (player == null) {
            return false;
        }
        player.setRoleId(roleId);
        return true;
    }

    public List<Role> getAvailableRoles() {
        Set<String> taken = new HashSet<>();
        players.values().forEach(p -> {
            if (p.getRoleId() != null) {
                taken.add(p.getRoleId());
            }
        });
        return Role.ALL.stream()
                .filter(r -> !taken.contains(r.id()))
                .toList();
    }

    public synchronized InteractionResult processInteraction(String playerId, String objectId) {
        if (gameState.isGameOver()) {
            return new InteractionResult(false, "The game is over.");
        }

        PlayerState player = players.get(playerId);
        if (player == null) return new InteractionResult(false, null);

        String role = player.getRoleId();
        if (role == null) return new InteractionResult(false, null);

        if ("captive".equals(role)) {
            return processCaptiveInteraction(objectId);
        } else {
            return processKillerInteraction(objectId);
        }
    }

    private InteractionResult processCaptiveInteraction(String objectId) {
        if (gameState.isKillerUpstairs() && !gameState.isCaptiveHiding()) {
            gameState.setGameOver(true);
            gameState.setWinner("killer");
            gameState.setGameOverReason("The killer caught you!");
            return new InteractionResult(true, "The killer caught you!");
        }

        SceneObject obj = gameState.getCaptiveRoomObject(objectId);
        if (obj == null || !obj.isVisible()) {
            return new InteractionResult(false, "Nothing to interact with.");
        }

        return switch (objectId) {
            case "floorboard" -> {
                if ("intact".equals(obj.getState())) {
                    obj.setState("pried_open");
                    gameState.addNoise(30);
                    gameState.addCaptiveRoomObject(new SceneObject("metal_rod", "item", obj.getX(), obj.getY(), true, "default", true));
                    yield new InteractionResult(true, "You pry up the floorboard. A rusted metal rod lies underneath.");
                }
                yield new InteractionResult(false, "The floorboard is already pried open.");
            }
            case "metal_rod" -> {
                if (obj.isCollectible() && obj.isVisible()) {
                    gameState.addCaptiveItem("metal_rod");
                    obj.setVisible(false);
                    gameState.addNoise(10);
                    yield new InteractionResult(true, "You pick up the metal rod.");
                }
                yield new InteractionResult(false, "Nothing there.");
            }
            case "bucket" -> {
                if (obj.isCollectible() && obj.isVisible()) {
                    gameState.addCaptiveItem("bucket");
                    obj.setVisible(false);
                    gameState.addNoise(5);
                    yield new InteractionResult(true, "You pick up the bucket.");
                }
                yield new InteractionResult(false, "Nothing there.");
            }
            case "window" -> {
                if ("loosened".equals(obj.getState())) {
                    gameState.setGameOver(true);
                    gameState.setWinner("captive");
                    gameState.setGameOverReason("The captive escaped through the window!");
                    yield new InteractionResult(true, "You push the window open and climb out. Freedom!");
                }
                if ("locked".equals(obj.getState()) && gameState.captiveHasItem("metal_rod")) {
                    obj.setState("loosened");
                    gameState.removeCaptiveItem("metal_rod");
                    gameState.addNoise(25);
                    yield new InteractionResult(true, "You work the latch with the metal rod. The window is loosened!");
                }
                yield new InteractionResult(false, "The window is locked tight. You need something to work the latch.");
            }
            case "bed" -> {
                gameState.setCaptiveHiding(true);
                yield new InteractionResult(true, "You hide under the bed, barely breathing.");
            }
            case "closet" -> {
                gameState.setCaptiveHiding(true);
                gameState.addNoise(5);
                yield new InteractionResult(true, "You slip into the closet. The door creaks.");
            }
            case "heating_pipe" -> {
                gameState.addNoise(40);
                yield new InteractionResult(true, "You rattle the heating pipe violently. The sound echoes through the walls.");
            }
            case "door" -> new InteractionResult(false, "The door is reinforced steel. There's no way through it.");
            default -> new InteractionResult(false, "You can't do anything with that.");
        };
    }

    private InteractionResult processKillerInteraction(String objectId) {
        SceneObject obj = gameState.getKillerRoomObject(objectId);
        if (obj == null || !obj.isVisible()) {
            return new InteractionResult(false, "Nothing to interact with.");
        }

        return switch (objectId) {
            case "security_monitors" -> {
                if (!gameState.isPowerOn()) {
                    yield new InteractionResult(true, "The monitors are dead. Someone cut the power.");
                }
                if (gameState.getNoiseLevel() > 0) {
                    yield new InteractionResult(true, "You hear muffled sounds from upstairs. Noise level: " + gameState.getNoiseLevel());
                }
                yield new InteractionResult(true, "Everything looks quiet.");
            }
            case "stairs" -> {
                gameState.setKillerUpstairs(true);
                gameState.setKillerActivity("checking_upstairs");
                if (!gameState.isCaptiveHiding()) {
                    gameState.setGameOver(true);
                    gameState.setWinner("killer");
                    gameState.setGameOverReason("You caught the captive!");
                    yield new InteractionResult(true, "You caught the captive!");
                }
                String message = "The room looks empty... for now.";
                gameState.setKillerUpstairs(false);
                gameState.setCaptiveHiding(false);
                gameState.setNoiseLevel(0);
                gameState.setKillerActivity("idle");
                yield new InteractionResult(true, message);
            }
            case "front_door" -> new InteractionResult(true, "No one there right now.");
            case "phone" -> new InteractionResult(true, "No calls right now.");
            case "light_switch" -> {
                if ("on".equals(obj.getState())) {
                    obj.setState("off");
                    gameState.setPowerOn(false);
                    yield new InteractionResult(true, "You cut the power to the upstairs.");
                }
                obj.setState("on");
                gameState.setPowerOn(true);
                yield new InteractionResult(true, "You restore power to the upstairs.");
            }
            case "workbench" -> new InteractionResult(true, "Your tools. Everything in its place.");
            case "wall_compartment" -> {
                if ("closed".equals(obj.getState())) {
                    obj.setState("open");
                    yield new InteractionResult(true, "The compartment is empty. Ready to hide evidence.");
                }
                obj.setState("closed");
                yield new InteractionResult(true, "You close the compartment.");
            }
            default -> new InteractionResult(false, "You can't do anything with that.");
        };
    }

    public Map<String, Object> getStateSnapshot() {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("roomCode", roomCode);
        snapshot.put("players", buildPlayersList());
        snapshot.put("availableRoles", getAvailableRoles());
        snapshot.put("gameOver", gameState.isGameOver());
        if (gameState.isGameOver()) {
            snapshot.put("winner", gameState.getWinner());
            snapshot.put("gameOverReason", gameState.getGameOverReason());
        }
        return snapshot;
    }

    public Map<String, Object> getCaptiveStateSnapshot() {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("roomCode", roomCode);
        snapshot.put("role", "captive");
        snapshot.put("players", buildPlayersList());
        snapshot.put("sceneObjects", buildObjectsList(gameState.getCaptiveRoomObjects()));
        snapshot.put("inventory", gameState.getCaptiveInventory());
        snapshot.put("noiseLevel", gameState.getNoiseLevel());
        snapshot.put("killerUpstairs", gameState.isKillerUpstairs());
        snapshot.put("powerOn", gameState.isPowerOn());
        snapshot.put("hiding", gameState.isCaptiveHiding());
        snapshot.put("gameOver", gameState.isGameOver());
        if (gameState.isGameOver()) {
            snapshot.put("winner", gameState.getWinner());
            snapshot.put("gameOverReason", gameState.getGameOverReason());
        }
        snapshot.put("puzzleStates", gameState.getPuzzleStates());
        return snapshot;
    }

    public Map<String, Object> getKillerStateSnapshot() {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("roomCode", roomCode);
        snapshot.put("role", "killer");
        snapshot.put("players", buildPlayersList());
        snapshot.put("sceneObjects", buildObjectsList(gameState.getKillerRoomObjects()));
        snapshot.put("inventory", gameState.getKillerInventory());
        snapshot.put("noiseLevel", gameState.getNoiseLevel());
        snapshot.put("suspicionLevel", gameState.getSuspicionLevel());
        snapshot.put("killerActivity", gameState.getKillerActivity());
        snapshot.put("powerOn", gameState.isPowerOn());
        snapshot.put("gameOver", gameState.isGameOver());
        if (gameState.isGameOver()) {
            snapshot.put("winner", gameState.getWinner());
            snapshot.put("gameOverReason", gameState.getGameOverReason());
        }
        snapshot.put("puzzleStates", gameState.getPuzzleStates());
        return snapshot;
    }

    private List<Map<String, Object>> buildPlayersList() {
        return players.values().stream()
                .map(p -> {
                    Map<String, Object> pm = new LinkedHashMap<>();
                    pm.put("playerId", p.getPlayerId());
                    pm.put("roleId", p.getRoleId());
                    pm.put("x", p.getX());
                    pm.put("y", p.getY());
                    pm.put("currentAnimation", p.getCurrentAnimation());
                    pm.put("connected", p.isConnected());
                    return pm;
                })
                .toList();
    }

    private List<Map<String, Object>> buildObjectsList(Map<String, SceneObject> objects) {
        return objects.values().stream()
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
                .toList();
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
