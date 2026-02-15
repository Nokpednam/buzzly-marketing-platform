import { supabase } from "@/integrations/supabase/client";

/**
 * Audit Event Categories
 */
export type AuditCategory =
    | "authentication"
    | "security"
    | "settings"
    | "data"
    | "campaign"
    | "integration";

/**
 * Audit Event Status
 */
export type AuditStatus = "success" | "failed";

/**
 * Parameters for logging an audit event
 */
export interface AuditEventParams {
    userId?: string | null;
    actionTypeId?: string;
    actionName: string;
    category: AuditCategory;
    description: string;
    status?: AuditStatus;
    ipAddress?: string;
    metadata?: Record<string, any>;
}

/**
 * Get client IP address (browser-side approximation)
 * In production, this should be done server-side
 */
async function getClientIP(): Promise<string> {
    try {
        // Try to get IP from a public API
        const response = await fetch('https://api.ipify.org?format=json', {
            signal: AbortSignal.timeout(2000) // 2 second timeout
        });
        const data = await response.json();
        return data.ip || 'unknown';
    } catch (error) {
        // Fallback if the API call fails
        return 'unknown';
    }
}

/**
 * Log an audit event to the database
 * 
 * @param params - Audit event parameters
 * @returns Promise<void>
 * 
 * @example
 * ```typescript
 * await logAuditEvent({
 *   userId: user.id,
 *   actionName: 'Login',
 *   category: 'authentication',
 *   description: 'User logged in successfully',
 *   status: 'success',
 *   metadata: { device: 'Chrome on Windows' }
 * });
 * ```
 */
export async function logAuditEvent(params: AuditEventParams): Promise<void> {
    try {
        const {
            userId,
            actionTypeId,
            actionName,
            category,
            description,
            status = 'success',
            ipAddress,
            metadata = {},
        } = params;

        // Get IP address if not provided
        const finalIpAddress = ipAddress || await getClientIP();

        // Get current user if userId not provided
        let finalUserId = userId;
        if (!finalUserId) {
            const { data: { user } } = await supabase.auth.getUser();
            finalUserId = user?.id || null;
        }

        // Insert audit log
        const { error } = await supabase
            .from('audit_logs_enhanced')
            .insert({
                user_id: finalUserId,
                action_type_id: actionTypeId || null,
                category,
                description,
                status,
                ip_address: finalIpAddress,
                metadata: {
                    ...metadata,
                    action_name: actionName,
                    timestamp: new Date().toISOString(),
                    user_agent: navigator?.userAgent || 'unknown',
                },
            });

        if (error) {
            console.error('[Audit Log Error]', error);
            // Don't throw - logging should never break the main application
        }
    } catch (error) {
        console.error('[Audit Log Exception]', error);
        // Silently fail - logging is non-critical
    }
}

/**
 * Log authentication events (login, logout, failed login)
 */
export const auditAuth = {
    login: (userId: string, role: string, email: string) =>
        logAuditEvent({
            userId,
            actionName: 'Login',
            category: 'authentication',
            description: `${role} user ${email} logged in`,
            status: 'success',
            metadata: { role, email },
        }),

    logout: (userId: string, role: string, email: string) =>
        logAuditEvent({
            userId,
            actionName: 'Logout',
            category: 'authentication',
            description: `${role} user ${email} logged out`,
            status: 'success',
            metadata: { role, email },
        }),

    loginFailed: (email: string, reason: string) =>
        logAuditEvent({
            userId: null,
            actionName: 'Login Failed',
            category: 'authentication',
            description: `Failed login attempt for ${email}: ${reason}`,
            status: 'failed',
            metadata: { email, reason },
        }),
};

/**
 * Log security/admin actions
 */
export const auditSecurity = {
    employeeApproved: (adminId: string, employeeId: string, employeeEmail: string) =>
        logAuditEvent({
            userId: adminId,
            actionName: 'Employee Approved',
            category: 'security',
            description: `Approved employee: ${employeeEmail}`,
            status: 'success',
            metadata: { employeeId, employeeEmail },
        }),

    employeeRegistered: async (
        userId: string,
        employeeEmail: string,
        employeeName: string
    ) => {
        await logAuditEvent({
            userId,
            category: 'security',
            actionName: 'Employee_Registered',
            description: `New employee registration: ${employeeName} (${employeeEmail}) - Pending approval`,
            status: 'success',
            metadata: {
                email: employeeEmail,
                name: employeeName,
                role: 'Employee',
            },
        });
    },

    employeeRejected: (adminId: string, employeeId: string, employeeEmail: string, reason?: string) =>
        logAuditEvent({
            userId: adminId,
            actionName: 'Employee Rejected',
            category: 'security',
            description: `Rejected employee: ${employeeEmail}`,
            status: 'success',
            metadata: { employeeId, employeeEmail, reason },
        }),

    roleChanged: (adminId: string, targetUserId: string, oldRole: string, newRole: string) =>
        logAuditEvent({
            userId: adminId,
            actionName: 'Role Changed',
            category: 'security',
            description: `Changed user role from ${oldRole} to ${newRole}`,
            status: 'success',
            metadata: { targetUserId, oldRole, newRole },
        }),

    userSuspended: (adminId: string, targetUserId: string, targetEmail: string, reason?: string) =>
        logAuditEvent({
            userId: adminId,
            actionName: 'User Suspended',
            category: 'security',
            description: `Suspended user: ${targetEmail}`,
            status: 'success',
            metadata: { targetUserId, targetEmail, reason },
        }),

    userActivated: (adminId: string, targetUserId: string, targetEmail: string) =>
        logAuditEvent({
            userId: adminId,
            actionName: 'User Activated',
            category: 'security',
            description: `Activated user: ${targetEmail}`,
            status: 'success',
            metadata: { targetUserId, targetEmail },
        }),
};

/**
 * Log settings changes
 */
export const auditSettings = {
    settingsChanged: (userId: string, settingName: string, oldValue: any, newValue: any) =>
        logAuditEvent({
            userId,
            actionName: 'Settings Changed',
            category: 'settings',
            description: `Changed ${settingName}`,
            status: 'success',
            metadata: { settingName, oldValue, newValue },
        }),

    apiKeyCreated: (userId: string, keyName: string) =>
        logAuditEvent({
            userId,
            actionName: 'API Key Created',
            category: 'settings',
            description: `Created API key: ${keyName}`,
            status: 'success',
            metadata: { keyName },
        }),

    apiKeyRevoked: (userId: string, keyName: string) =>
        logAuditEvent({
            userId,
            actionName: 'API Key Revoked',
            category: 'settings',
            description: `Revoked API key: ${keyName}`,
            status: 'success',
            metadata: { keyName },
        }),
};

/**
 * Log data export/import actions
 */
export const auditData = {
    dataExported: (userId: string, dataType: string, recordCount: number) =>
        logAuditEvent({
            userId,
            actionName: 'Data Exported',
            category: 'data',
            description: `Exported ${recordCount} ${dataType} records`,
            status: 'success',
            metadata: { dataType, recordCount },
        }),

    dataImported: (userId: string, dataType: string, recordCount: number) =>
        logAuditEvent({
            userId,
            actionName: 'Data Imported',
            category: 'data',
            description: `Imported ${recordCount} ${dataType} records`,
            status: 'success',
            metadata: { dataType, recordCount },
        }),
};

/**
 * Log campaign actions
 */
export const auditCampaign = {
    campaignCreated: (userId: string, campaignId: string, campaignName: string) =>
        logAuditEvent({
            userId,
            actionName: 'Campaign Created',
            category: 'campaign',
            description: `Created campaign: ${campaignName}`,
            status: 'success',
            metadata: { campaignId, campaignName },
        }),

    campaignDeleted: (userId: string, campaignId: string, campaignName: string) =>
        logAuditEvent({
            userId,
            actionName: 'Campaign Deleted',
            category: 'campaign',
            description: `Deleted campaign: ${campaignName}`,
            status: 'success',
            metadata: { campaignId, campaignName },
        }),
};
