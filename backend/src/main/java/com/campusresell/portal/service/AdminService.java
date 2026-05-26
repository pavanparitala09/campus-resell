package com.campusresell.portal.service;

import com.campusresell.portal.model.Product;
import com.campusresell.portal.model.ProductStatus;
import com.campusresell.portal.model.User;
import com.campusresell.portal.repository.ProductRepository;
import com.campusresell.portal.repository.ReportRepository;
import com.campusresell.portal.repository.SearchLogRepository;
import com.campusresell.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private SearchLogRepository searchLogRepository;

    public Map<String, Object> getAnalytics() {
        Map<String, Object> stats = new HashMap<>();

        long totalUsers = userRepository.count();
        long verifiedUsers = userRepository.countByVerified(true);
        long activeListings = productRepository.countByStatus(ProductStatus.AVAILABLE);
        long soldListings = productRepository.countByStatus(ProductStatus.SOLD);
        long pendingReports = reportRepository.countByStatus("PENDING");

        // Sum price of all sold listings for total transaction volume
        BigDecimal totalSalesVolume = productRepository.findAll().stream()
                .filter(p -> p.getStatus() == ProductStatus.SOLD)
                .map(Product::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        stats.put("totalUsers", totalUsers);
        stats.put("verifiedUsers", verifiedUsers);
        stats.put("activeListings", activeListings);
        stats.put("soldListings", soldListings);
        stats.put("pendingReports", pendingReports);
        stats.put("totalSalesVolume", totalSalesVolume);

        // Fetch top 5 most searched categories
        List<Object[]> categorySearchData = searchLogRepository.findMostSearchedCategories(PageRequest.of(0, 5));
        List<Map<String, Object>> topCategories = categorySearchData.stream().map(row -> {
            Map<String, Object> item = new HashMap<>();
            item.put("category", row[0]);
            item.put("count", row[1]);
            return item;
        }).collect(Collectors.toList());
        stats.put("topCategories", topCategories);

        // Fetch top 5 most searched terms
        List<Object[]> querySearchData = searchLogRepository.findMostSearchedQueries(PageRequest.of(0, 5));
        List<Map<String, Object>> topQueries = querySearchData.stream().map(row -> {
            Map<String, Object> item = new HashMap<>();
            item.put("query", row[0]);
            item.put("count", row[1]);
            return item;
        }).collect(Collectors.toList());
        stats.put("topQueries", topQueries);

        return stats;
    }

    @Transactional
    public void blockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        // Set user to unverified, locking their login capabilities
        user.setVerified(false);
        userRepository.save(user);
    }

    @Transactional
    public void unblockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setVerified(true);
        userRepository.save(user);
    }
}
