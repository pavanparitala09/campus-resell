package com.campusresell.portal.dto;

import com.campusresell.portal.model.LostFoundImage;
import com.campusresell.portal.model.LostFoundItem;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LostFoundResponse {
    private Long id;
    private UserResponse reporter;
    private String title;
    private String description;
    private String type;
    private String location;
    private boolean resolved;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    private List<String> images;

    public static LostFoundResponse fromItem(LostFoundItem item) {
        if (item == null) return null;
        return LostFoundResponse.builder()
                .id(item.getId())
                .reporter(UserResponse.fromUser(item.getUser()))
                .title(item.getTitle())
                .description(item.getDescription())
                .type(item.getType().name())
                .location(item.getLocation())
                .resolved(item.isResolved())
                .createdAt(item.getCreatedAt())
                .resolvedAt(item.getResolvedAt())
                .images(item.getImages().stream().map(LostFoundImage::getImageUrl).collect(Collectors.toList()))
                .build();
    }
}
