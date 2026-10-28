package com.kq.model;

import java.util.List;

public record Role(String id, String name, String description) {

    public static final Role CAPTIVE = new Role("captive", "The Captive", "Trapped upstairs. Find a way to escape before it's too late.");
    public static final Role KILLER = new Role("killer", "The Killer", "Keep your captive contained. Don't let anyone find out.");

    public static final List<Role> ALL = List.of(CAPTIVE, KILLER);

    public static Role findById(String id) {
        return ALL.stream()
                .filter(r -> r.id().equals(id))
                .findFirst()
                .orElse(null);
    }
}
