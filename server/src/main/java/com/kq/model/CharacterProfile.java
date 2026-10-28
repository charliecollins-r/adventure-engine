package com.kq.model;

import java.util.List;

public record CharacterProfile(String id, String name, String spriteKey) {

    public static final CharacterProfile GRAHAM = new CharacterProfile("graham", "King Graham", "graham_sprite");
    public static final CharacterProfile CEDRIC = new CharacterProfile("cedric", "Cedric", "cedric_sprite");

    public static final List<CharacterProfile> ALL = List.of(GRAHAM, CEDRIC);

    public static CharacterProfile findById(String id) {
        return ALL.stream()
                .filter(p -> p.id().equals(id))
                .findFirst()
                .orElse(null);
    }
}
