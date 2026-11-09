package example.craft;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

record CreateOrder(@NotBlank @Size(max=80) String name) {}
@Service
class OrderService {
 final AtomicInteger writes=new AtomicInteger();
 void create(CreateOrder input) { writes.incrementAndGet(); }
}
@RestController
@ConditionalOnProperty(name="craft.example.defective",havingValue="false",matchIfMissing=true)
class OrdersController {
 private final OrderService service;
 OrdersController(OrderService service) { this.service=service; }
 @PostMapping("/orders")
 ResponseEntity<Map<String,Boolean>> create(@Valid @RequestBody CreateOrder input) {
  service.create(input);return ResponseEntity.status(201).body(Map.of("created",true));
 }
}
/** Explicit teaching variant: request validation annotation is absent. */
@RestController
@ConditionalOnProperty(name="craft.example.defective",havingValue="true")
class DefectiveOrdersController {
 private final OrderService service;
 DefectiveOrdersController(OrderService service) { this.service=service; }
 @PostMapping("/orders")
 ResponseEntity<Map<String,Boolean>> create(@RequestBody CreateOrder input) {
  service.create(input);return ResponseEntity.status(201).body(Map.of("created",true));
 }
}
