import { CopyTwoTone, EditTwoTone } from '@ant-design/icons';
import { Button, Flex, Tooltip, message } from 'antd';
interface GuestProps {
  content: string;
}
const GuestMenu = (prop: GuestProps) => {
  const { content } = prop;
  const success = () => {
    message.success('复制成功');
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    success();
  };
  return (
    <Flex gap="small" vertical>
      <Flex wrap gap="small">
        <Tooltip title="复制">
          <Button
            onClick={handleCopy}
            type="primary"
            shape="default"
            icon={<CopyTwoTone />}
          />
        </Tooltip>
        <Tooltip title="编辑">
          <Button icon={<EditTwoTone />} />
        </Tooltip>
      </Flex>
    </Flex>
  );
};

export default GuestMenu;
