import { Controller } from "../../src/decorators/controller.decorator";

@Controller({ route: '/TestRoute/' })
export class CustomRouteController {
  constructor() { }
}
