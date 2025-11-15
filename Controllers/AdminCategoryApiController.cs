using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;

namespace QuanLyChiTieu_WebApp.Controllers.Api
{
    [Route("api/admin")]
    [ApiController]
    public class AdminCategoryApiController : ControllerBase
    {
        private readonly string _connectionString;

        public AdminCategoryApiController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        // ========== ICONS ==========

        // GET: api/admin/icons
        [HttpGet("icons")]
        public async Task<IActionResult> GetAllIcons()
        {
            var icons = new List<object>();

            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                var command = new SqlCommand("SELECT IconID, IconName, IconClass FROM Icons ORDER BY IconName", connection);

                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        icons.Add(new
                        {
                            iconID = reader.GetInt32(0),
                            iconName = reader.GetString(1),
                            iconClass = reader.GetString(2)
                        });
                    }
                }
            }

            return Ok(icons);
        }

        // POST: api/admin/icons
        [HttpPost("icons")]
        public async Task<IActionResult> CreateIcon([FromBody] IconCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.IconName) || string.IsNullOrWhiteSpace(dto.IconClass))
            {
                return BadRequest(new { message = "Icon Name và Icon Class không được để trống" });
            }

            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                // Kiểm tra trùng lặp
                var checkCmd = new SqlCommand(
                    "SELECT COUNT(*) FROM Icons WHERE IconName = @IconName OR IconClass = @IconClass",
                    connection);
                checkCmd.Parameters.AddWithValue("@IconName", dto.IconName);
                checkCmd.Parameters.AddWithValue("@IconClass", dto.IconClass);

                var count = (int)await checkCmd.ExecuteScalarAsync();
                if (count > 0)
                {
                    return BadRequest(new { message = "Icon Name hoặc Icon Class đã tồn tại" });
                }

                // Thêm mới
                var insertCmd = new SqlCommand(
                    "INSERT INTO Icons (IconName, IconClass) VALUES (@IconName, @IconClass); SELECT SCOPE_IDENTITY();",
                    connection);
                insertCmd.Parameters.AddWithValue("@IconName", dto.IconName);
                insertCmd.Parameters.AddWithValue("@IconClass", dto.IconClass);

                var newId = await insertCmd.ExecuteScalarAsync();

                return Ok(new
                {
                    iconID = Convert.ToInt32(newId),
                    iconName = dto.IconName,
                    iconClass = dto.IconClass
                });
            }
        }

        // DELETE: api/admin/icons/{id}
        [HttpDelete("icons/{id}")]
        public async Task<IActionResult> DeleteIcon(int id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                // Kiểm tra xem icon có đang được sử dụng không
                var checkCmd = new SqlCommand(
                    "SELECT COUNT(*) FROM Categories WHERE IconID = @IconID",
                    connection);
                checkCmd.Parameters.AddWithValue("@IconID", id);

                var count = (int)await checkCmd.ExecuteScalarAsync();
                if (count > 0)
                {
                    return BadRequest(new { message = $"Icon này đang được sử dụng bởi {count} category. Không thể xóa!" });
                }

                // Xóa icon
                var deleteCmd = new SqlCommand("DELETE FROM Icons WHERE IconID = @IconID", connection);
                deleteCmd.Parameters.AddWithValue("@IconID", id);

                var rowsAffected = await deleteCmd.ExecuteNonQueryAsync();

                if (rowsAffected == 0)
                {
                    return NotFound(new { message = "Không tìm thấy icon" });
                }

                return Ok(new { message = "Xóa icon thành công" });
            }
        }

        // ========== COLORS ==========

        // GET: api/admin/colors
        [HttpGet("colors")]
        public async Task<IActionResult> GetAllColors()
        {
            var colors = new List<object>();

            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                var command = new SqlCommand("SELECT ColorID, ColorName, HexCode FROM Colors ORDER BY ColorName", connection);

                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        colors.Add(new
                        {
                            colorID = reader.GetInt32(0),
                            colorName = reader.GetString(1),
                            hexCode = reader.GetString(2)
                        });
                    }
                }
            }

            return Ok(colors);
        }

        // POST: api/admin/colors
        [HttpPost("colors")]
        public async Task<IActionResult> CreateColor([FromBody] ColorCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.ColorName) || string.IsNullOrWhiteSpace(dto.HexCode))
            {
                return BadRequest(new { message = "Color Name và Hex Code không được để trống" });
            }

            // Validate hex code format
            if (!dto.HexCode.StartsWith("#") || dto.HexCode.Length != 7)
            {
                return BadRequest(new { message = "Hex Code phải có định dạng #RRGGBB" });
            }

            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                // Kiểm tra trùng lặp
                var checkCmd = new SqlCommand(
                    "SELECT COUNT(*) FROM Colors WHERE ColorName = @ColorName OR HexCode = @HexCode",
                    connection);
                checkCmd.Parameters.AddWithValue("@ColorName", dto.ColorName);
                checkCmd.Parameters.AddWithValue("@HexCode", dto.HexCode);

                var count = (int)await checkCmd.ExecuteScalarAsync();
                if (count > 0)
                {
                    return BadRequest(new { message = "Color Name hoặc Hex Code đã tồn tại" });
                }

                // Thêm mới
                var insertCmd = new SqlCommand(
                    "INSERT INTO Colors (ColorName, HexCode) VALUES (@ColorName, @HexCode); SELECT SCOPE_IDENTITY();",
                    connection);
                insertCmd.Parameters.AddWithValue("@ColorName", dto.ColorName);
                insertCmd.Parameters.AddWithValue("@HexCode", dto.HexCode);

                var newId = await insertCmd.ExecuteScalarAsync();

                return Ok(new
                {
                    colorID = Convert.ToInt32(newId),
                    colorName = dto.ColorName,
                    hexCode = dto.HexCode
                });
            }
        }

        // DELETE: api/admin/colors/{id}
        [HttpDelete("colors/{id}")]
        public async Task<IActionResult> DeleteColor(int id)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                // Kiểm tra xem color có đang được sử dụng không
                var checkCmd = new SqlCommand(
                    "SELECT COUNT(*) FROM Categories WHERE ColorID = @ColorID",
                    connection);
                checkCmd.Parameters.AddWithValue("@ColorID", id);

                var count = (int)await checkCmd.ExecuteScalarAsync();
                if (count > 0)
                {
                    return BadRequest(new { message = $"Màu này đang được sử dụng bởi {count} category. Không thể xóa!" });
                }

                // Xóa color
                var deleteCmd = new SqlCommand("DELETE FROM Colors WHERE ColorID = @ColorID", connection);
                deleteCmd.Parameters.AddWithValue("@ColorID", id);

                var rowsAffected = await deleteCmd.ExecuteNonQueryAsync();

                if (rowsAffected == 0)
                {
                    return NotFound(new { message = "Không tìm thấy màu" });
                }

                return Ok(new { message = "Xóa màu thành công" });
            }
        }
    }

    // DTOs
    public class IconCreateDto
    {
        public string IconName { get; set; }
        public string IconClass { get; set; }
    }

    public class ColorCreateDto
    {
        public string ColorName { get; set; }
        public string HexCode { get; set; }
    }
}