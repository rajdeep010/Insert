'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { DEFAULT_RELEASE_DRAFT_TEMPLATE } from '@/features/project/utils/releaseDraftTemplate'

interface ReleaseDraftTemplateModalProps {
  open: boolean
  currentTemplate?: string | null
  isSaving?: boolean
  onClose: () => void
  onSave: (template: string) => Promise<void> | void
}

const ReleaseDraftTemplateModal = ({
  open,
  currentTemplate,
  isSaving = false,
  onClose,
  onSave,
}: ReleaseDraftTemplateModalProps) => {
  const [template, setTemplate] = useState('')

  const normalizedCurrent = useMemo(
    () => String(currentTemplate || '').replace(/\r\n/g, '\n').trim(),
    [currentTemplate]
  )

  useEffect(() => {
    setTemplate(normalizedCurrent)
  }, [normalizedCurrent, open])

  const hasExisting = normalizedCurrent.length > 0

  const handleSave = async () => {
    await onSave(template)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Release Draft Template</DialogTitle>
          <DialogDescription>
            This will be a template when a release blog is created.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={hasExisting ? 'secondary' : 'outline'}>
              {hasExisting ? 'Template configured' : 'No template yet'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Supported placeholders: {'{title}'}, {'{{title}}'}
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="release-draft-template">Template Content</Label>
            <Textarea
              id="release-draft-template"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="min-h-[280px] font-mono text-xs"
              placeholder={DEFAULT_RELEASE_DRAFT_TEMPLATE}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setTemplate(DEFAULT_RELEASE_DRAFT_TEMPLATE)}
              disabled={isSaving}
            >
              Use Default Template
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setTemplate('')}
              disabled={isSaving}
            >
              Clear
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : hasExisting ? (
              'Update Template'
            ) : (
              'Add Template'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ReleaseDraftTemplateModal
