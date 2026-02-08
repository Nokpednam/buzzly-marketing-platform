import { EmployeesList } from "@/components/team/EmployeesList";

export default function EmployeeManagement() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
                <p className="text-muted-foreground mt-2">
                    จัดการพนักงาน Admin, Support และ Developer - อนุมัติ/ปฏิเสธผู้สมัครใหม่
                </p>
            </div>

            <EmployeesList canManage={true} />
        </div>
    );
}
