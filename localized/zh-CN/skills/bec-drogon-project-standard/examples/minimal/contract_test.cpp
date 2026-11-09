#include "contract.h"
#include <cstdlib>
#include <iostream>
#include <string>
int main() {
 RoleFilter::defective=std::getenv("CRAFT_EXAMPLE_DEFECTIVE")&&std::string(std::getenv("CRAFT_EXAMPLE_DEFECTIVE"))=="1";
 RoleFilter filter;OrdersController controller;auto request=drogon::HttpRequest::newHttpRequest();
 int responses=0;drogon::HttpStatusCode rejected=drogon::kUnknown;
 filter.doFilter(request,[&](const drogon::HttpResponsePtr &response){responses++;rejected=response->getStatusCode();},[&](){controller.create(request,[&](const drogon::HttpResponsePtr &){responses++;});});
 if(rejected!=drogon::k401Unauthorized||OrdersController::writes.load()!=0||responses!=1){std::cerr<<"CONTRACT_FAILURE rejected filter reached controller or replied twice\n";return 1;}
 request->addHeader("X-Craft-Role","allowed");
 filter.doFilter(request,[&](const drogon::HttpResponsePtr &){std::cerr<<"CONTRACT_FAILURE valid request rejected\n";},[&](){controller.create(request,[](const drogon::HttpResponsePtr &){});});
 if(OrdersController::writes.load()!=1){std::cerr<<"CONTRACT_FAILURE valid request must have one effect\n";return 1;}
 std::cout<<"CONTRACT_PASS filter authorization and continuation\n";
}
