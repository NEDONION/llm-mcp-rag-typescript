import { render, screen } from '@testing-library/react';
import Guest from './index';
import '@testing-library/jest-dom';

describe('Guest component', () => {
  it('should render', () => {
    const testContent = 'Hello, my name is marisa!';
    render(<Guest content={testContent} />);

    // 检查组件是否正确渲染
    const guestText = screen.getByText(testContent);
    expect(guestText).toBeInTheDocument();

    // 检查组件是否应用了正确的CSS类
    const guestDiv = screen.getByText(testContent).parentElement;
    expect(guestDiv).toHaveClass('chat-guest');
  });
});
