package com.campusresell.portal.service;

import com.campusresell.portal.dto.ReportRequest;
import com.campusresell.portal.dto.ReportResponse;
import com.campusresell.portal.model.*;
import com.campusresell.portal.repository.ProductRepository;
import com.campusresell.portal.repository.ReportRepository;
import com.campusresell.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AuthService authService;

    @Transactional
    public ReportResponse submitReport(ReportRequest request) {
        User reporter = authService.getCurrentUser();
        if (reporter == null) {
            throw new IllegalStateException("Authentication required to report listings or users");
        }

        User reportedUser = null;
        if (request.getReportedUserId() != null) {
            reportedUser = userRepository.findById(request.getReportedUserId()).orElse(null);
        }

        Product reportedProduct = null;
        if (request.getReportedProductId() != null) {
            reportedProduct = productRepository.findById(request.getReportedProductId()).orElse(null);
        }

        Report report = Report.builder()
                .reporter(reporter)
                .reportedUser(reportedUser)
                .reportedProduct(reportedProduct)
                .reason(request.getReason())
                .status("PENDING")
                .build();

        Report saved = reportRepository.save(report);
        return ReportResponse.fromReport(saved);
    }

    public List<ReportResponse> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(ReportResponse::fromReport)
                .collect(Collectors.toList());
    }

    @Transactional
    public void resolveReport(Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));
        report.setStatus("RESOLVED");
        reportRepository.save(report);
    }
}
