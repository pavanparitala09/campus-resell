package com.campusresell.portal.controller;

import com.campusresell.portal.dto.ReportResponse;
import com.campusresell.portal.service.AdminService;
import com.campusresell.portal.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private AdminService adminService;

    @GetMapping("/reports")
    public ResponseEntity<List<ReportResponse>> getReports() {
        List<ReportResponse> reports = reportService.getAllReports();
        return ResponseEntity.ok(reports);
    }

    @PostMapping("/reports/{id}/resolve")
    public ResponseEntity<?> resolveReport(@PathVariable Long id) {
        try {
            reportService.resolveReport(id);
            return ResponseEntity.ok(Map.of("message", "Report resolved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        Map<String, Object> stats = adminService.getAnalytics();
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/users/{userId}/block")
    public ResponseEntity<?> blockUser(@PathVariable Long userId) {
        try {
            adminService.blockUser(userId);
            return ResponseEntity.ok(Map.of("message", "User blocked successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/users/{userId}/unblock")
    public ResponseEntity<?> unblockUser(@PathVariable Long userId) {
        try {
            adminService.unblockUser(userId);
            return ResponseEntity.ok(Map.of("message", "User unblocked successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
