// Example usage component to show how to use the real-time tracking
import { useInsertProjects } from "@/app/context/InsertProjectProvider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"



export const ReleaseSyncButton = ({ projectId }: { projectId: string }) => {
    const {
        syncRelease,
        isSyncingRelease,
        releaseSyncStatus,
        webSocketConnected,
        clearReleaseSyncStatus
    } = useInsertProjects()

    const isLoading = isSyncingRelease[projectId] || false
    const syncStatus = releaseSyncStatus[projectId]

    const handleSyncRelease = async () => {
        await syncRelease(projectId)
    }

    const handleClearStatus = () => {
        clearReleaseSyncStatus(projectId)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Button
                    onClick={handleSyncRelease}
                    disabled={isLoading}
                    className="relative"
                >
                    {isLoading ? "Syncing..." : "Sync Release"}
                    {isLoading && (
                        <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    )}
                </Button>

                <Badge variant={webSocketConnected ? "default" : "destructive"}>
                    {webSocketConnected ? "Connected" : "Disconnected"}
                </Badge>
            </div>

            {syncStatus && (
                <div className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Release Status</h4>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearStatus}
                        >
                            Clear
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge
                                variant={
                                    syncStatus.buildStatus === 'READY' ? 'default' :
                                        syncStatus.buildStatus === 'ERROR' ? 'destructive' :
                                            'secondary'
                                }
                            >
                                {syncStatus.buildStatus}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                                {new Date(syncStatus.timestamp).toLocaleTimeString()}
                            </span>
                        </div>

                        <p className="text-sm">{syncStatus.message}</p>
                    </div>
                </div>
            )}
        </div>
    )
}