import { Controller } from "@nestjs/common"
import type { HospitalManagerService } from "./hospitalManager.service"

@Controller("hospital-manager")
export class HospitalManagerController {
	constructor(readonly _hospitalManagerService: HospitalManagerService) {}
}
