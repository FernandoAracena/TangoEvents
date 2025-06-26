using Microsoft.EntityFrameworkCore;
using TangoKultura.Data;

namespace TangoKultura.Helpers
{
    public static class DataHelper
    {

        public static async Task ManageDataAsync(IServiceProvider svcProvider)
        {
            //Service: An instance of db context
            var dbContextSvc = svcProvider.GetRequiredService<ApplicationDbContext>();

            //Migration: This is the programmatic equivalent to Update-Database
            // await dbContextSvc.Database.MigrateAsync();

            // Set default city to 'Oslo' for existing events with null or empty city
            var eventsToUpdate = dbContextSvc.Events.Where(e => string.IsNullOrEmpty(e.City));
            foreach (var ev in eventsToUpdate)
            {
                ev.City = "Oslo";
            }
            await dbContextSvc.SaveChangesAsync();
        }


    }
}
