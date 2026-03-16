import React, { useEffect, useState } from "react";
import { getMaterialDetail } from "../../services/moderation";
import { changeMaterialStatus } from "../../services/moderatorFilterApi";
import { useParams, useNavigate } from "react-router-dom";

const ModeratorMaterialReviewPage: React.FC = () => {
  const { id } = useParams();
  const [material, setMaterial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      getMaterialDetail(id)
        .then((data) => {
          setMaterial(data);
          setStatus(data.status);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleReview = async (newStatus: string) => {
    if (!id) return;
    try {
      await changeMaterialStatus(id, newStatus);
      alert("Cập nhật trạng thái thành công!");
      navigate("/moderator/pending");
    } catch(err) {
      alert("Lỗi cập nhật trạng thái");
    }
  };

  if (loading) return <p>Đang tải...</p>;
  if (!material) return <p>Không tìm thấy tài liệu.</p>;

  return (
    <div>
      <h2>Chi tiết tài liệu</h2>
      <p>
        <b>Tiêu đề:</b> {material.title}
      </p>
      <p>
        <b>Loại:</b> {material.type}
      </p>
      <p>
        <b>Trạng thái hiện tại:</b> {status}
      </p>
      <button onClick={() => handleReview("reviewed")}>Duyệt</button>
      <button onClick={() => handleReview("rejected")}>Từ chối</button>
      <button onClick={() => navigate("/moderator/pending")}>Quay lại</button>
    </div>
  );
};

export default ModeratorMaterialReviewPage;
