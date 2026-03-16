import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { filterMaterials } from "../../services/moderatorFilterApi";

const defaultFilter = {
  type: "",
  status: "pending",
  keyword: "",
  fromDate: "",
  toDate: "",
};

const ModeratorPendingMaterialsPage: React.FC = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(defaultFilter);
  const navigate = useNavigate();

  const fetchData = async (params = filter) => {
    setLoading(true);
    try {
      const data = await filterMaterials({ ...params, status: "pending" });
      setMaterials(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleViewDetail = (id: string) => {
    navigate(`/moderator/review/${id}`);
  };

  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFilter((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(filter);
  };

  return (
    <div>
      <h2>Danh sách tài liệu chờ duyệt</h2>
      <form style={{ marginBottom: 16 }} onSubmit={handleFilter}>
        <input
          name="keyword"
          placeholder="Tìm kiếm..."
          value={filter.keyword}
          onChange={handleInput}
        />
        <select name="type" value={filter.type} onChange={handleInput}>
          <option value="">Tất cả loại</option>
          <option value="slide">Slide</option>
          <option value="file">File</option>
          <option value="quiz">Quiz</option>
          <option value="2d_render">2D Render</option>
        </select>
        <input
          name="fromDate"
          type="date"
          value={filter.fromDate}
          onChange={handleInput}
        />
        <input
          name="toDate"
          type="date"
          value={filter.toDate}
          onChange={handleInput}
        />
        <button type="submit">Lọc</button>
      </form>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Loại</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th>Lý do gần nhất</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m) => (
              <tr key={m._id}>
                <td>{m.title}</td>
                <td>{m.type}</td>
                <td>{new Date(m.dateCreate).toLocaleString()}</td>
                <td>{m.status || "pending"}</td>
                <td>{m.latestReason || m.reason || "-"}</td>
                <td>
                  <button onClick={() => handleViewDetail(m._id)}>
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ModeratorPendingMaterialsPage;
