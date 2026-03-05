export type IconName =
  | 'account-circle'
  | 'add'
  | 'chat-bubble-outline'
  | 'ai'
  | 'send'
  | 'stop'
  | 'download'
  | 'folder'
  | 'copy'
  | 'edit'
  | 'delete'
  | 'document-txt'
  | 'document-docx'
  | 'document-folder'
  | 'document-task'
  | 'arrow-left'
  | 'chevron-right'
  | 'chevron-left'
  | 'check-circle-outline'
  | 'check'
  | 'clipboard-list'
  | 'list'
  | 'list-box'
  | 'list-box-outline'
  | 'error'
  | 'style';

export interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
  color?: string;
  variant?: 'filled' | 'outlined' | 'auto';
  strokeWidth?: number;
  onClick?: (event: React.MouseEvent<SVGSVGElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<SVGSVGElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<SVGSVGElement>) => void;
}

export interface IconButtonProps {
  icon: IconName;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}
