using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SecureNotesApp.Models;

namespace SecureNotesApp.Data
{
    public class ApplicationDbContext : IdentityDbContext<IdentityUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<SavedAccount> SavedAccounts { get; set; }
        public DbSet<TodoTask> TodoTasks { get; set; }
        public DbSet<Prompt> Prompts { get; set; }
    }
}