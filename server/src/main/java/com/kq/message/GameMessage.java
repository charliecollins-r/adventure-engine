package com.kq.message;

import com.fasterxml.jackson.databind.JsonNode;

public record GameMessage(MessageType type, JsonNode payload) {
}
