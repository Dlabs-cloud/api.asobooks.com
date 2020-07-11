export interface AccessStatus {
    reason(): string;

    hasAccess(): boolean;
}

function allowed(): AccessStatus {
    return {
        reason(): string {
            return null;
        },
        hasAccess(): boolean {
            return true;
        }
    };
}

function deniedFor() {
    return denied('Authorised');
}

function denied(reason: string): AccessStatus {
    return {
        reason(): string {
            return reason;
        },
        hasAccess(): boolean {
            return false;
        }
    };
}