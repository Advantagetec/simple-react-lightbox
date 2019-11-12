import React from "react";
import PropTypes from "prop-types";
import {
  SRLLightboxThubnailGallery,
  SRLLightboxThubnailGalleryImage
} from "../../styles";

const SRLLightboxThubnailGalleryComponent = ({
  images,
  currentId,
  handleCurrentImage
}) => {
  return (
    <SRLLightboxThubnailGallery className="SRLThumbnails">
      {images.map((i, index) => {
        return (
          <SRLLightboxThubnailGalleryImage
            onClick={() => handleCurrentImage(i.id)}
            key={index}
            className={`SRLThumb SRLThumb${index} ${
              currentId === i.id ? "SRLSelected" : ""
            }`}
            style={{ backgroundImage: `url("${i.thumb}")` }}
          />
        );
      })}
    </SRLLightboxThubnailGallery>
  );
};

export default SRLLightboxThubnailGalleryComponent;

SRLLightboxThubnailGalleryComponent.propTypes = {
  images: PropTypes.array,
  handleCurrentImage: PropTypes.func,
  currentId: PropTypes.string
};
