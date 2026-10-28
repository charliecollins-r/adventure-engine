package com.kq.model;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class GameState {

    private int noiseLevel = 0;
    private int suspicionLevel = 0;
    private String killerActivity = "idle";
    private long killerActivityStartTime = 0;
    private boolean killerUpstairs = false;
    private boolean captiveHiding = false;
    private boolean powerOn = true;
    private boolean gameOver = false;
    private String winner = null;
    private String gameOverReason = null;

    private final List<String> captiveInventory = new ArrayList<>();
    private final Map<String, SceneObject> captiveRoomObjects = new LinkedHashMap<>();

    private final List<String> killerInventory = new ArrayList<>();
    private final Map<String, SceneObject> killerRoomObjects = new LinkedHashMap<>();

    private final Map<String, String> puzzleStates = new LinkedHashMap<>();

    public int getNoiseLevel() { return noiseLevel; }
    public void setNoiseLevel(int noiseLevel) { this.noiseLevel = Math.max(0, Math.min(100, noiseLevel)); }
    public void addNoise(int amount) { setNoiseLevel(this.noiseLevel + amount); }
    public void decayNoise(int amount) { setNoiseLevel(this.noiseLevel - amount); }

    public int getSuspicionLevel() { return suspicionLevel; }
    public void setSuspicionLevel(int suspicionLevel) { this.suspicionLevel = Math.max(0, Math.min(100, suspicionLevel)); }
    public void addSuspicion(int amount) { setSuspicionLevel(this.suspicionLevel + amount); }

    public String getKillerActivity() { return killerActivity; }
    public void setKillerActivity(String killerActivity) {
        this.killerActivity = killerActivity;
        this.killerActivityStartTime = System.currentTimeMillis();
    }
    public long getKillerActivityStartTime() { return killerActivityStartTime; }

    public boolean isKillerUpstairs() { return killerUpstairs; }
    public void setKillerUpstairs(boolean killerUpstairs) { this.killerUpstairs = killerUpstairs; }

    public boolean isCaptiveHiding() { return captiveHiding; }
    public void setCaptiveHiding(boolean captiveHiding) { this.captiveHiding = captiveHiding; }

    public boolean isPowerOn() { return powerOn; }
    public void setPowerOn(boolean powerOn) { this.powerOn = powerOn; }

    public boolean isGameOver() { return gameOver; }
    public void setGameOver(boolean gameOver) { this.gameOver = gameOver; }
    public String getWinner() { return winner; }
    public void setWinner(String winner) { this.winner = winner; }
    public String getGameOverReason() { return gameOverReason; }
    public void setGameOverReason(String reason) { this.gameOverReason = reason; }

    public List<String> getCaptiveInventory() { return captiveInventory; }
    public void addCaptiveItem(String itemId) { if (!captiveInventory.contains(itemId)) captiveInventory.add(itemId); }
    public boolean captiveHasItem(String itemId) { return captiveInventory.contains(itemId); }
    public void removeCaptiveItem(String itemId) { captiveInventory.remove(itemId); }

    public List<String> getKillerInventory() { return killerInventory; }
    public void addKillerItem(String itemId) { if (!killerInventory.contains(itemId)) killerInventory.add(itemId); }
    public boolean killerHasItem(String itemId) { return killerInventory.contains(itemId); }
    public void removeKillerItem(String itemId) { killerInventory.remove(itemId); }

    public Map<String, SceneObject> getCaptiveRoomObjects() { return captiveRoomObjects; }
    public Map<String, SceneObject> getKillerRoomObjects() { return killerRoomObjects; }
    public void addCaptiveRoomObject(SceneObject obj) { captiveRoomObjects.put(obj.getId(), obj); }
    public void addKillerRoomObject(SceneObject obj) { killerRoomObjects.put(obj.getId(), obj); }
    public SceneObject getCaptiveRoomObject(String id) { return captiveRoomObjects.get(id); }
    public SceneObject getKillerRoomObject(String id) { return killerRoomObjects.get(id); }

    public Map<String, String> getPuzzleStates() { return puzzleStates; }
    public String getPuzzleState(String key) { return puzzleStates.get(key); }
    public void setPuzzleState(String key, String value) { puzzleStates.put(key, value); }
}
