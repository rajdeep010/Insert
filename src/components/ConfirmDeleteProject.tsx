import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Loader2, Trash2 } from 'lucide-react'
import { Button } from './ui/button'

interface ConfirmDeleteProjectProps {
    deleteConfirm: {
        isOpen: boolean
        projectId: string
        projectName: string
        isDeleting: boolean
    }
    onConfirm: () => void
    onCancel: () => void
}

const ConfirmDeleteProject: React.FC<ConfirmDeleteProjectProps> = ({
    deleteConfirm,
    onConfirm,
    onCancel
}) => {
    return (
        <Dialog open={deleteConfirm.isOpen} onOpenChange={onCancel}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-red-600 flex items-center gap-2">
                        <Trash2 className="h-5 w-5" />
                        Delete Project
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 mt-3">
                        This action cannot be undone. This will permanently delete the project
                        <span className="font-semibold text-black dark:text-white mx-1">
                            "{deleteConfirm.projectName}"
                        </span>
                        and all of its data including release blogs and configurations.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-3 mt-4">
                    <p className="text-sm text-red-800 dark:text-red-200">
                        <strong>Warning:</strong> This will also remove any GitHub webhooks associated with this project.
                    </p>
                </div>

                <DialogFooter className="gap-2 mt-6">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={deleteConfirm.isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={deleteConfirm.isDeleting}
                        className="gap-2"
                    >
                        {deleteConfirm.isDeleting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4" />
                                Delete Project
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ConfirmDeleteProject