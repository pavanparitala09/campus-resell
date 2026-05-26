package com.campusresell.portal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessageRequest {
    @NotBlank(message = "Message content cannot be blank")
    private String content;
}
