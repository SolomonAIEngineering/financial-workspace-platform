'use client';

import React, { useState } from 'react';

import type { Value } from '@udecode/plate';

import { cn } from '@udecode/cn';
import { CommentsPlugin } from '@udecode/plate-comments/react';
import { Plate, useEditorPlugin, useStoreValue } from '@udecode/plate/react';
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  format,
} from 'date-fns';
import {
  CheckIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
  XIcon,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import {
  discussionStore,
  useFakeCurrentUserId,
  useFakeUserInfo,
} from './block-discussion';
import { Button } from './button';
import { useCommentEditor } from './comment-create-form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Editor, EditorContainer } from './editor';

export const formatCommentDate = (date: Date) => {
  const now = new Date();
  const diffMinutes = differenceInMinutes(now, date);
  const diffHours = differenceInHours(now, date);
  const diffDays = differenceInDays(now, date);

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }
  if (diffHours < 24) {
    return `${diffHours}h`;
  }
  if (diffDays < 2) {
    return `${diffDays}d`;
  }

  return format(date, 'MM/dd/yyyy');
};

export interface TComment {
  id: string;
  contentRich: Value;
  createdAt: Date;
  discussionId: string;
  isEdited: boolean;
  userId: string;
}

export function Comment(props: {
  comment: TComment;
  discussionLength: number;
  editingId: string | null;
  index: number;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  documentContent?: string;
  showDocumentContent?: boolean;
  onEditorClick?: () => void;
}) {
  const {
    comment,
    discussionLength,
    documentContent,
    editingId,
    index,
    setEditingId,
    showDocumentContent = false,
    onEditorClick,
  } = props;
  // const { user } = comment;

  const discussions = useStoreValue(discussionStore, 'discussions');
  const userInfo = useFakeUserInfo(comment.userId);
  const currentUserId = useFakeCurrentUserId();

  const resolveDiscussion = (id: string) => {
    const updatedDiscussions = discussions.map((discussion) => {
      if (discussion.id === id) {
        return { ...discussion, isResolved: true };
      }

      return discussion;
    });
    discussionStore.set('discussions', updatedDiscussions);
  };

  const removeDiscussion = (id: string) => {
    const updatedDiscussions = discussions.filter(
      (discussion: any) => discussion.id !== id
    );
    discussionStore.set('discussions', updatedDiscussions);
  };

  const updateComment = (input: {
    id: string;
    contentRich: any;
    discussionId: string;
    isEdited: boolean;
  }) => {
    const updatedDiscussions = discussions.map((discussion) => {
      if (discussion.id === input.discussionId) {
        const updatedComments = discussion.comments.map((comment) => {
          if (comment.id === input.id) {
            return {
              ...comment,
              contentRich: input.contentRich,
              isEdited: true,
              updatedAt: new Date(),
            };
          }

          return comment;
        });

        return { ...discussion, comments: updatedComments };
      }

      return discussion;
    });
    discussionStore.set('discussions', updatedDiscussions);
  };

  const { tf } = useEditorPlugin(CommentsPlugin);

  // Replace to your own backend or refer to potion
  const isMyComment = currentUserId === comment.userId;

  const initialValue = comment.contentRich;

  const commentEditor = useCommentEditor(
    {
      id: comment.id,
      value: initialValue,
    },
    [initialValue]
  );

  const onCancel = () => {
    setEditingId(null);
    commentEditor.tf.replaceNodes(initialValue, {
      at: [],
      children: true,
    });
  };

  const onSave = () => {
    void updateComment({
      id: comment.id,
      contentRich: commentEditor.children,
      discussionId: comment.discussionId,
      isEdited: true,
    });
    setEditingId(null);
  };

  const onResolveComment = () => {
    void resolveDiscussion(comment.discussionId);
    tf.comment.unsetMark({ id: comment.discussionId });
  };

  const isFirst = index === 0;
  const isLast = index === discussionLength - 1;
  const isEditing = editingId && editingId === comment.id;

  const [hovering, setHovering] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div
      className="group py-2 transition-colors duration-200 ease-in-out"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="relative flex items-center gap-2">
        {userInfo && (
          <Avatar className="size-7 ring-2 ring-background">
            <AvatarImage alt={userInfo.name} src={userInfo.avatarUrl} />
            <AvatarFallback className="bg-primary/10 font-medium text-primary">
              {userInfo.name?.[0]}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="flex flex-col">
          <h4 className="text-sm leading-none font-semibold">
            {userInfo?.name}
          </h4>
          <div className="mt-0.5 flex items-center text-xs text-muted-foreground/80">
            <span>{formatCommentDate(new Date(comment.createdAt))}</span>
            {comment.isEdited && <span className="ml-1 italic">(edited)</span>}
          </div>
        </div>

        {isMyComment && (
          <div
            className={cn(
              'absolute top-0 right-0 flex items-center space-x-1 opacity-0 transition-opacity duration-200',
              (hovering || dropdownOpen) && 'opacity-100'
            )}
          >
            {index === 0 && (
              <Button
                variant="ghost"
                className="h-7 w-7 rounded-full p-0 transition-colors hover:bg-success/10 hover:text-success"
                onClick={onResolveComment}
                title="Resolve comment"
                type="button"
              >
                <CheckIcon className="size-4" />
              </Button>
            )}

            <CommentMoreDropdown
              onCloseAutoFocus={() => {
                setTimeout(() => {
                  commentEditor.tf.focus({ edge: 'endEditor' });
                }, 0);
              }}
              onRemoveComment={() => {
                if (discussionLength === 1) {
                  tf.comment.unsetMark({ id: comment.discussionId });
                  void removeDiscussion(comment.discussionId);
                }
              }}
              comment={comment}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
              setEditingId={setEditingId}
            />
          </div>
        )}
      </div>

      {isFirst && showDocumentContent && (
        <div className="relative mt-2 ml-[32px] rounded-md bg-muted/30 py-1.5 pl-2 text-sm text-subtle-foreground">
          {discussionLength > 1 && (
            <div className="absolute top-0 left-[3px] h-full w-0.5 shrink-0 rounded-full bg-muted" />
          )}
          <div className="absolute top-0 left-0 h-full w-1 rounded-l-md bg-highlight" />
          {documentContent && <div>{documentContent}</div>}
        </div>
      )}

      <div className="relative mt-2 ml-[26px]">
        {!isLast && (
          <div className="absolute top-0 left-[3px] h-full w-0.5 shrink-0 rounded-full bg-muted/60" />
        )}
        <Plate readOnly={!isEditing} editor={commentEditor}>
          <EditorContainer
            variant="comment"
            className={cn(
              'transition-all duration-200',
              isEditing ? 'ring-1 shadow-sm ring-primary/20' : ''
            )}
          >
            <Editor
              variant="comment"
              className="w-auto grow"
              onClick={() => onEditorClick?.()}
            />

            {isEditing && (
              <div className="ml-auto flex shrink-0 gap-1 p-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 rounded-full transition-colors hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    void onCancel();
                  }}
                  title="Cancel editing"
                >
                  <XIcon className="size-4" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 rounded-full transition-colors hover:bg-success/10 hover:text-success"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    void onSave();
                  }}
                  title="Save comment"
                >
                  <CheckIcon className="size-4" />
                </Button>
              </div>
            )}
          </EditorContainer>
        </Plate>
      </div>
    </div>
  );
}

interface CommentMoreDropdownProps {
  comment: TComment;
  dropdownOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  onCloseAutoFocus?: () => void;
  onRemoveComment?: () => void;
}

export function CommentMoreDropdown(props: CommentMoreDropdownProps) {
  const {
    comment,
    dropdownOpen,
    setDropdownOpen,
    setEditingId,
    onCloseAutoFocus,
    onRemoveComment,
  } = props;

  const discussions = useStoreValue(discussionStore, 'discussions');

  const selectedEditCommentRef = React.useRef<boolean>(false);

  const onDeleteComment = React.useCallback(() => {
    if (!comment.id)
      return alert('You are operating too quickly, please try again later.');

    // Find and update the discussion
    const updatedDiscussions = discussions.map((discussion: any) => {
      if (discussion.id !== comment.discussionId) {
        return discussion;
      }

      const commentIndex = discussion.comments.findIndex(
        (c: any) => c.id === comment.id
      );

      if (commentIndex === -1) {
        return discussion;
      }

      return {
        ...discussion,
        comments: [
          ...discussion.comments.slice(0, commentIndex),
          ...discussion.comments.slice(commentIndex + 1),
        ],
      };
    });

    // Save back to session storage
    discussionStore.set('discussions', updatedDiscussions);
    onRemoveComment?.();
  }, [comment.discussionId, comment.id, discussions, onRemoveComment]);

  const onEditComment = React.useCallback(() => {
    selectedEditCommentRef.current = true;

    if (!comment.id)
      return alert('You are operating too quickly, please try again later.');

    setEditingId(comment.id);
  }, [comment.id, setEditingId]);

  return (
    <DropdownMenu
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
      modal={false}
    >
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          className="h-7 w-7 rounded-full p-0 transition-colors hover:bg-muted"
          title="Comment options"
        >
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-52 animate-in p-1 fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        onCloseAutoFocus={(e) => {
          if (selectedEditCommentRef.current) {
            onCloseAutoFocus?.();
            selectedEditCommentRef.current = false;
          }

          return e.preventDefault();
        }}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/60"
            onClick={onEditComment}
          >
            <PencilIcon className="size-4 text-muted-foreground" />
            <span>Edit comment</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-destructive/10 hover:text-destructive"
            onClick={onDeleteComment}
          >
            <TrashIcon className="size-4" />
            <span>Delete comment</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
