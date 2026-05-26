package com.campusresell.portal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequest {
    private Long reportedUserId;
    private Long reportedProductId;
    
    @NotBlank(message = "Reason is required")
    private String reason;
}
