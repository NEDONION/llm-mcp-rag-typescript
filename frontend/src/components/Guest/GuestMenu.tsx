import { CopyTwoTone, EditTwoTone } from '@ant-design/icons';
import { Button, Flex, Tooltip, message } from 'antd';
interface GuestProps {
  content: string;
}
const GuestMenu = (prop: GuestProps) => {
  const { content } = prop;
  const success = () => {
    message.success('Copied successfully');
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    success();
  };
  return (
    <Flex gap="small" vertical>
      <Flex wrap gap="small">
        <Tooltip title="Copy">
          <Button
            onClick={handleCopy}
            type="primary"
            shape="default"
            icon={<CopyTwoTone />}
          />
        </Tooltip>
        <Tooltip title="Edit">
          <Button icon={<EditTwoTone />} />
        </Tooltip>
      </Flex>
    </Flex>
  );
};

export default GuestMenu;
