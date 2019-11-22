import { ApiController } from "../../src/api-controller";
import { Controller } from "../../src/decorators/controller.decorator";

@Controller({ route: '/TestRoute/' })
export class CustomRouteController extends ApiController {
  constructor() {
    super();
  }
}
