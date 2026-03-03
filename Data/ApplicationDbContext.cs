using Microsoft.EntityFrameworkCore;
using SecureNotesApp.Models;

namespace SecureNotesApp.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<SavedAccount> SavedAccounts { get; set; }
        public DbSet<TodoTask> TodoTasks { get; set; }
    }
}