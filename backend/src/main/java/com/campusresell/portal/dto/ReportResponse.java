package com.campusresell.portal.dto;

import com.campusresell.portal.model.Report;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportResponse {
    private Long id;
    private UserResponse reporter;
    private UserResponse reportedUser;
    private ProductResponse reportedProduct;
    private String reason;
    private String status;
    private LocalDateTime createdAt;

    public static ReportResponse fromReport(Report report) {
        if (report == null) return null;
        return ReportResponse.builder()
                .id(report.getId())
                .reporter(UserResponse.fromUser(report.getReporter()))
                .reportedUser(UserResponse.fromUser(report.getReportedUser()))
                .reportedProduct(ProductResponse.fromProduct(report.getReportedProduct()))
                .reason(report.getReason())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
