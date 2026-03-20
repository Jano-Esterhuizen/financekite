using System;

namespace FinanceKite.API.Controllers;

using FinanceKite.API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public abstract class BaseController : ControllerBase
{
    // Extracts the authenticated user's ID from their JWT token
    protected Guid CurrentUserId => User.GetUserId();
}

/*
📘 Why [Authorize] on the base controller? 
Every controller inherits from BaseController, which means every endpoint is protected by default. 
You'd have to explicitly opt out with [AllowAnonymous] to make something public. 
This is the secure by default principle — it's much safer than remembering to add [Authorize] to every controller individually.

📘 Why abstract? BaseController is never instantiated directly — it only exists to be inherited. 
abstract enforces this.
*/
