package example.craft;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class OrdersTest {
 @Autowired MockMvc mvc;
 @Autowired OrderService service;
 @BeforeEach void reset() { service.writes.set(0); }
 @Test void invalidInputHasNoEffects() throws Exception {
  mvc.perform(post("/orders").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"\"}")).andExpect(status().isBadRequest());
  assertEquals(0,service.writes.get(),"invalid input must not reach persistence boundary");
 }
 @Test void validInputHasOneEffect() throws Exception {
  mvc.perform(post("/orders").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"one\"}")).andExpect(status().isCreated());
  assertEquals(1,service.writes.get());
 }
}
