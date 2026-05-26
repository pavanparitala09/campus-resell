package com.campusresell.portal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LostFoundRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Type (LOST/FOUND) is required")
    private String type;

    @NotBlank(message = "Location is required")
    private String location;
}
