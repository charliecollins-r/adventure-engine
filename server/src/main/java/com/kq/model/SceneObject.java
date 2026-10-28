package com.kq.model;

public class SceneObject {

    private final String id;
    private final String type;
    private double x;
    private double y;
    private boolean visible;
    private String state;
    private final boolean collectible;

    public SceneObject(String id, String type, double x, double y, boolean visible, String state, boolean collectible) {
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;
        this.visible = visible;
        this.state = state;
        this.collectible = collectible;
    }

    public String getId() { return id; }
    public String getType() { return type; }
    public double getX() { return x; }
    public double getY() { return y; }
    public boolean isVisible() { return visible; }
    public String getState() { return state; }
    public boolean isCollectible() { return collectible; }

    public void setX(double x) { this.x = x; }
    public void setY(double y) { this.y = y; }
    public void setVisible(boolean visible) { this.visible = visible; }
    public void setState(String state) { this.state = state; }
}
