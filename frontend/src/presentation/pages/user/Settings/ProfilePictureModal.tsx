import { useRef, useState, useEffect } from 'react';
import { FaTimes, FaUpload, FaEdit, FaImage, FaUserAlt, FaCamera } from 'react-icons/fa';
import { ImageCropper } from './ImageCropper';
import { ProfilePictureModalProps } from '../../../../domain/types/settings/user';

export const ProfilePictureModal = ({
  isOpen,
  onClose,
  currentImage,
  onImageUpdate,
}: ProfilePictureModalProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [cropData, setCropData] = useState({
    x: 100,
    y: 100,
    size: 200,
    scale: 1,
    rotate: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setShowCropper(true);
        setCropData({
          x: 100,
          y: 100,
          size: 200,
          scale: 1,
          rotate: 0,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditCurrent = () => {
    if (currentImage) {
      setSelectedImage(currentImage);
      setShowCropper(true);
      setCropData({
        x: 100,
        y: 100,
        size: 200,
        scale: 1,
        rotate: 0,
      });
    }
  };

  const handleCropApply = (file: File) => {
    onImageUpdate(file);
    onClose();
    resetModal();
  };

  const handleCancel = () => {
    setShowCropper(false);
    setSelectedImage(null);
    setCropData({
      x: 100,
      y: 100,
      size: 200,
      scale: 1,
      rotate: 0,
    });
  };

  const resetModal = () => {
    setSelectedImage(null);
    setShowCropper(false);
    setCropData({
      x: 100,
      y: 100,
      size: 200,
      scale: 1,
      rotate: 0,
    });
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  const handleChooseDifferent = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-sky-50 to-slate-50 -m-6 mb-4 p-4 rounded-t-2xl border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center shadow-sm">
                <FaCamera className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Update Profile Picture</h3>
                <p className="text-slate-600 text-xs">Upload or edit your profile image</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-100 rounded-lg"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!showCropper ? (
          <div className="text-center">
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 mb-4">
              <div className="w-24 h-24 rounded-xl bg-sky-100 border-2 border-sky-200 shadow-sm mx-auto mb-4 overflow-hidden">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt="Current Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaUserAlt className="w-8 h-8 text-sky-600" />
                  </div>
                )}
              </div>

              <h4 className="text-base font-semibold text-slate-800 mb-1">
                {currentImage ? 'Current Profile Picture' : 'No Profile Picture'}
              </h4>
              <p className="text-slate-600 text-xs">
                {currentImage ? 'You can edit or replace your current image' : 'Upload your first profile picture'}
              </p>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                {currentImage && (
                  <button
                    onClick={handleEditCurrent}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
                  >
                    <FaEdit className="w-3.5 h-3.5 mr-1.5" />
                    Edit Current Image
                  </button>
                )}

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
                >
                  <FaUpload className="w-3.5 h-3.5 mr-1.5" />
                  {currentImage ? 'Upload New Picture' : 'Choose Picture'}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-slate-700">
                  <FaImage className="w-3.5 h-3.5 text-sky-500" />
                  <span className="font-medium text-xs">Image Requirements</span>
                </div>
                <div className="space-y-0.5 text-slate-600 text-xs">
                  <p>• Supported formats: JPG, PNG, GIF</p>
                  <p>• Maximum file size: 5MB</p>
                  <p>• Recommended: Square images work best</p>
                </div>
              </div>

              {currentImage && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-center gap-2 text-sky-600 text-xs">
                    <FaEdit className="w-3.5 h-3.5" />
                    <span>Your current image can be cropped and adjusted</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <ImageCropper
            selectedImage={selectedImage || ''}
            cropData={cropData}
            onCropChange={setCropData}
            onCropApply={handleCropApply}
            onCancel={handleCancel}
            onChooseDifferent={handleChooseDifferent}
          />
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
};