using System.ComponentModel.DataAnnotations;

namespace QuanLyChiTieu_WebApp.ViewModels
{
    public class CreateTicketViewModel
    {

        [Required(ErrorMessage = "Vui lòng chọn loại câu hỏi.")]
        public string QuestionType { get; set; }


        //[Required(ErrorMessage = "Vui lòng chọn loại phản hồi.")]
        //public string RespondType { get; set; }


        [Required(ErrorMessage = "Vui lòng nhập mô tả.")]
        [MinLength(20, ErrorMessage = "Mô tả phải có ít nhất 20 ký tự.")]
        public string Description { get; set; }
    }
}