package com.kq.model;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class GameState {

    private String currentScene = "room1";
    private final List<String> inventory = new ArrayList<>();
    private final Map<String, SceneObject> sceneObjects = new LinkedHashMap<>();
    private final Map<String, String> puzzleStates = new LinkedHashMap<>();

    public String getCurrentScene() { return currentScene; }
    public List<String> getInventory() { return inventory; }
    public Map<String, SceneObject> getSceneObjects() { return sceneObjects; }
    public Map<String, String> getPuzzleStates() { return puzzleStates; }

    public void setCurrentScene(String currentScene) { this.currentScene = currentScene; }

    public void addItem(String itemId) {
        if (!inventory.contains(itemId)) {
            inventory.add(itemId);
        }
    }

    public boolean hasItem(String itemId) {
        return inventory.contains(itemId);
    }

    public void removeItem(String itemId) {
        inventory.remove(itemId);
    }

    public void addSceneObject(SceneObject obj) {
        sceneObjects.put(obj.getId(), obj);
    }

    public SceneObject getSceneObject(String objectId) {
        return sceneObjects.get(objectId);
    }
}
