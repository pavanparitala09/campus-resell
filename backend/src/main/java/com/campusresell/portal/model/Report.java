package com.campusresell.portal.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reported_user_id")
    private User reportedUser;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reported_product_id")
    private Product reportedProduct;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;
    
    @Column(nullable = false)
    private String status; // PENDING, RESOLVED
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
    }
}
