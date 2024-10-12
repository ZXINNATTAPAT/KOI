import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3500/api/login', {
        email: values.email,
        password: values.password,
      });

      if (response.status === 200) {
        message.success('Login successful!');
        
        // เก็บ Access Token ใน localStorage
        localStorage.setItem('accessToken', response.data.accessToken);
        
        // เปลี่ยนเส้นทางไปยังหน้า dashboard หรือหน้าอื่นๆ หลังจากล็อกอินสำเร็จ
        navigate('/');
      }
    } catch (error) {
      message.error('Invalid email or password');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '50px' }}>
      <h2>Login</h2>
      <Form
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Log In
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
