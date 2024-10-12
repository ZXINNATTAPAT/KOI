import React, { useState } from 'react';
import { Form, Input, Button, DatePicker, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await axios.post('http://localhost:3500/api/register', {
        email: values.email,
        first_name: values.first_name,
        last_name: values.last_name,
        tel: values.tel,
        birthday: moment(values.birthday).format('YYYY-MM-DD'),
        password: values.password,
      });

      if (response.status === 201) {
        message.success('Registration successful!');
        navigate('/login'); // ส่งผู้ใช้ไปยังหน้า Login หลังจากลงทะเบียนสำเร็จ
      }
    } catch (error) {
      message.error('Registration failed!');
      console.error('Error during registration:', error);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '50px' }}>
      <h2>Register</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'The input is not valid email!' },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="First Name"
          name="first_name"
          rules={[{ required: true, message: 'Please input your first name!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="last_name"
          rules={[{ required: true, message: 'Please input your last name!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Telephone"
          name="tel"
          rules={[{ required: true, message: 'Please input your telephone number!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Birthday"
          name="birthday"
          rules={[{ required: true, message: 'Please select your birthday!' }]}
        >
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Confirm Password"
          name="confirm_password"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords do not match!'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Register
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;
