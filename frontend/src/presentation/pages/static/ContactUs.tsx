import { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Input } from '../../components/base/Input';
import { Button } from '../../components/base/Button';
import { Textarea } from '../../components/base/Textarea';
import { useSectionAnimation } from '../../../shared/hooks/useSectionAnimation';
import { ContactFormData, contactFormSchema } from '../../../domain/validation/authentication/contactUs';

const ContactUs = () => {
  const isVisible = useSectionAnimation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const backendUrl = import.meta.env.VITE_API_BASE_URL;
      await axios.post(`${backendUrl}/enquiries`, {
        name: data.name.trim(),
        email: data.email.trim(),
        subject: data.subject.trim(),
        message: data.message.trim()
      });

      toast.success('Thank you! Your message has been sent successfully.');

      reset();

      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error: unknown) {
      console.error('Error submitting enquiry:', error);
      const errorMessage = axios.isAxiosError(error) 
        ? error.response?.data?.message || 'Failed to send message. Please try again.'
        : 'Failed to send message. Please try again.';
      toast.error(errorMessage);
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact-us"
      data-animate
      className={`w-full bg-gradient-to-b from-cyan-50 via-white to-cyan-50 pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-20 md:pb-30 transition-all duration-800 ${isVisible["contact-us"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan-800 mb-3 sm:mb-4">Contact Us</h2>
          <p className="text-base sm:text-lg lg:text-xl text-cyan-600 max-w-2xl mx-auto px-4">
            Have questions? We're here to help. Contact our team for support or inquiries.
          </p>
          <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 mx-auto mt-3 sm:mt-4" />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 bg-white rounded-xl overflow-hidden shadow-sm">
          {/* Left Section - Contact Info */}
          <div className="lg:w-2/5 bg-gradient-to-r from-cyan-600 to-blue-600 p-6 sm:p-8 text-white">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Get in Touch</h3>
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-start sm:items-center">
                <FaEnvelope className="text-cyan-200 mr-3 sm:mr-4 text-lg sm:text-xl mt-1 sm:mt-0 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm sm:text-base">Email</p>
                  <p className="text-cyan-100 text-sm sm:text-base">contact@academia.edu</p>
                </div>
              </div>
              <div className="flex items-start sm:items-center">
                <FaPhone className="text-cyan-200 mr-3 sm:mr-4 text-lg sm:text-xl mt-1 sm:mt-0 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm sm:text-base">Phone</p>
                  <p className="text-cyan-100 text-sm sm:text-base">+1 234 567 890</p>
                </div>
              </div>
              <div className="flex items-start sm:items-center">
                <FaMapMarkerAlt className="text-cyan-200 mr-3 sm:mr-4 text-lg sm:text-xl mt-1 sm:mt-0 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm sm:text-base">Address</p>
                  <p className="text-cyan-100 text-sm sm:text-base">123 University Avenue, City, Country</p>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8">
              <p className="font-medium mb-3 sm:mb-4 text-sm sm:text-base">Follow Us</p>
              <div className="flex space-x-3 sm:space-x-4">
                <a href="#" className="text-cyan-200 hover:text-white transition-colors transform hover:scale-110">
                  <FaFacebook className="text-xl sm:text-2xl" />
                </a>
                <a href="#" className="text-cyan-200 hover:text-white transition-colors transform hover:scale-110">
                  <FaTwitter className="text-xl sm:text-2xl" />
                </a>
                <a href="#" className="text-cyan-200 hover:text-white transition-colors transform hover:scale-110">
                  <FaInstagram className="text-xl sm:text-2xl" />
                </a>
              </div>
            </div>
          </div>

          <div className="lg:w-3/5 p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-semibold text-cyan-800 mb-4 sm:mb-6">Send us a Message</h3>
            {submitSuccess && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-100 border border-green-400 text-green-700 rounded text-sm sm:text-base">
                Thank you for your message! We'll get back to you soon.
              </div>
            )}

            {submitError && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm sm:text-base">
                {submitError}
              </div>
            )}

            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Input
                    id="name"
                    placeholder="Your Name"
                    {...register('name')}
                    disabled={isSubmitting}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your Email"
                    {...register('email')}
                    disabled={isSubmitting}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>
              <div>
                <Input
                  id="subject"
                  placeholder="Subject"
                  {...register('subject')}
                  disabled={isSubmitting}
                  className={errors.subject ? 'border-red-500' : ''}
                />
                {errors.subject && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.subject.message}</p>
                )}
              </div>
              <div>
                <Textarea
                  id="message"
                  placeholder="Your Message"
                  {...register('message')}
                  disabled={isSubmitting}
                  rows={4}
                  className={errors.message ? 'border-red-500' : ''}
                />
                {errors.message && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.message.message}</p>
                )}
              </div>
              <Button
                type="submit"
                label={isSubmitting ? "Sending..." : "Send Message"}
                variant="primary"
                className="w-full flex justify-center items-center py-3 sm:py-4 text-sm sm:text-base"
                disabled={isSubmitting}
              />
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;