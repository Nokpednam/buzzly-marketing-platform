import { EmployeesList } from "@/components/team/EmployeesList";

export default function EmployeeManagement() {
    return (
        <div className="space-y-6 text-slate-200 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Employee Management</h1>
                <p className="text-slate-400 font-medium mt-2">
                    จัดการพนักงาน Developer - อนุมัติ/ปฏิเสธผู้สมัครใหม่
                </p>
            </div>

            <EmployeesList canManage={true} />
        </div>
    );
}
