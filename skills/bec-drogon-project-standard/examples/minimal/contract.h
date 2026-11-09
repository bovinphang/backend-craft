#pragma once
#include <drogon/drogon.h>
#include <atomic>
#include <functional>

class RoleFilter : public drogon::HttpFilter<RoleFilter> {
public:
 inline static bool defective=false;
 void doFilter(const drogon::HttpRequestPtr &request,drogon::FilterCallback &&reject,drogon::FilterChainCallback &&next) override {
  if(request->getHeader("X-Craft-Role")!="allowed") {
   auto response=drogon::HttpResponse::newHttpResponse();response->setStatusCode(drogon::k401Unauthorized);reject(response);
   // The response callback does not return from this C++ method.
   if(!defective) return;
  }
  next();
 }
};
class OrdersController : public drogon::HttpController<OrdersController> {
public:
 inline static std::atomic<int> writes{0};
 METHOD_LIST_BEGIN
 ADD_METHOD_TO(OrdersController::create,"/orders",drogon::Post,"RoleFilter");
 METHOD_LIST_END
 void create(const drogon::HttpRequestPtr &,std::function<void(const drogon::HttpResponsePtr &)> &&callback) const {
  writes.fetch_add(1);auto response=drogon::HttpResponse::newHttpResponse();response->setStatusCode(drogon::k201Created);callback(response);
 }
};
