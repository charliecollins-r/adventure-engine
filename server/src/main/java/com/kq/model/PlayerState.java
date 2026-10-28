package com.kq.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.web.socket.WebSocketSession;

public class PlayerState {

    private final String playerId;
    private String roleId;
    private double x;
    private double y;
    private String currentAnimation;
    private boolean connected;

    @JsonIgnore
    private transient WebSocketSession webSocketSession;

    public PlayerState(String playerId) {
        this.playerId = playerId;
        this.x = 400;
        this.y = 300;
        this.currentAnimation = "idle";
        this.connected = true;
    }

    public String getPlayerId() { return playerId; }
    public String getRoleId() { return roleId; }
    public double getX() { return x; }
    public double getY() { return y; }
    public String getCurrentAnimation() { return currentAnimation; }
    public boolean isConnected() { return connected; }

    @JsonIgnore
    public WebSocketSession getWebSocketSession() { return webSocketSession; }

    public void setRoleId(String roleId) { this.roleId = roleId; }
    public void setX(double x) { this.x = x; }
    public void setY(double y) { this.y = y; }
    public void setCurrentAnimation(String currentAnimation) { this.currentAnimation = currentAnimation; }
    public void setConnected(boolean connected) { this.connected = connected; }
    public void setWebSocketSession(WebSocketSession webSocketSession) { this.webSocketSession = webSocketSession; }
}
