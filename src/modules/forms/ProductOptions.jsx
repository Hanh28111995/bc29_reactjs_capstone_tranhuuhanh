import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Space,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

export default function ProductOptions() {
  return (
    <Card
      title="Tùy chọn sản phẩm (Options)"
      style={{ marginBottom: 24 }}
    >
      <Form.List name="options">
        {(optionFields, { add: addOption, remove: removeOption }) => (
          <>
            {optionFields.map(({ key, name, ...restField }) => (
              <Card
                key={key}
                type="inner"
                title={`Nhóm tùy chọn ${name + 1}`}
                style={{ marginBottom: 16 }}
                extra={
                  <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => removeOption(name)}
                  />
                }
              >
                <Form.Item
                  {...restField}
                  name={[name, "name"]}
                  label="Tên nhóm"
                  rules={[{ required: true, message: "Nhập tên nhóm!" }]}
                >
                  <Input placeholder="Ví dụ: Taste 1, Size..." />
                </Form.Item>

                <Form.Item
                  name={[name, "required"]}
                  valuePropName="checked"
                >
                  <Checkbox>Bắt buộc lựa chọn</Checkbox>
                </Form.Item>

                <Form.List name={[name, "choices"]}>
                  {(choiceFields, { add, remove }) => (
                    <>
                      {choiceFields.map(
                        ({ key: choiceKey, name: choiceName, ...choiceRest }) => (
                          <Space
                            key={choiceKey}
                            align="start"
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              marginBottom: 8,
                            }}
                          >
                            <Form.Item
                              {...choiceRest}
                              name={[choiceName, "value"]}
                              rules={[
                                { required: true, message: "Nhập ID!" },
                              ]}
                            >
                              <Input placeholder="ID" />
                            </Form.Item>

                            <Form.Item
                              name={[choiceName, "label"]}
                              rules={[
                                { required: true, message: "Nhập tên!" },
                              ]}
                            >
                              <Input placeholder="Tên lựa chọn" />
                            </Form.Item>

                            <Form.Item name={[choiceName, "price"]}>
                              <InputNumber min={0} placeholder="Giá" />
                            </Form.Item>

                            <Form.Item name={[choiceName, "addPrice"]}>
                              <InputNumber min={0} placeholder="Phụ phí" />
                            </Form.Item>

                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => remove(choiceName)}
                            />
                          </Space>
                        ),
                      )}

                      <Button
                        type="dashed"
                        onClick={() =>
                          add({
                            value: "",
                            label: "",
                            price: 0,
                            addPrice: 0,
                          })
                        }
                        block
                        icon={<PlusOutlined />}
                      >
                        Thêm lựa chọn
                      </Button>
                    </>
                  )}
                </Form.List>
              </Card>
            ))}

            <Button
              type="dashed"
              onClick={() =>
                addOption({ name: "", required: false, choices: [] })
              }
              block
              icon={<PlusOutlined />}
            >
              Thêm nhóm tùy chọn
            </Button>
          </>
        )}
      </Form.List>
    </Card>
  );
}
