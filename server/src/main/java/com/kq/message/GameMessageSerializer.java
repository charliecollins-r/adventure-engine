package com.kq.message;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

public final class GameMessageSerializer {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private GameMessageSerializer() {}

    public static GameMessage deserialize(String json) throws JsonProcessingException {
        JsonNode root = MAPPER.readTree(json);
        MessageType type = MessageType.valueOf(root.get("type").asText());
        JsonNode payload = root.has("payload") ? root.get("payload") : MAPPER.createObjectNode();
        return new GameMessage(type, payload);
    }

    public static String serialize(GameMessage message) throws JsonProcessingException {
        ObjectNode root = MAPPER.createObjectNode();
        root.put("type", message.type().name());
        root.set("payload", message.payload());
        return MAPPER.writeValueAsString(root);
    }

    public static String serialize(MessageType type, Object payload) throws JsonProcessingException {
        ObjectNode root = MAPPER.createObjectNode();
        root.put("type", type.name());
        root.set("payload", MAPPER.valueToTree(payload));
        return MAPPER.writeValueAsString(root);
    }

    public static ObjectMapper mapper() {
        return MAPPER;
    }
}
