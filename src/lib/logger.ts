import { supabase } from "@/lib/supabaseClient";

export async function logActivity(
    actionType: "LOGIN" | "CREATE" | "UPDATE" | "DELETE",
    entityType: "STUDENT" | "FACULTY" | "BATCH" | "SYSTEM",
    entityId: string,
    description: string,
    performedBy: string = "Admin"
) {
    try {
        await supabase.from("system_logs").insert([{
            action_type: actionType,
            entity_type: entityType,
            entity_id: entityId,
            description: description,
            performed_by: performedBy
        }]);
    } catch (e) {
        console.error("Failed to log activity:", e);
    }
}
