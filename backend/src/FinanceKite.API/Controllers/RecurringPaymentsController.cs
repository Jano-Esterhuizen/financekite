using System;

namespace FinanceKite.API.Controllers;

using FinanceKite.Application.Features.RecurringPayments;
using Microsoft.AspNetCore.Mvc;

[Route("api/businesses/{businessId:guid}/recurring-payments")]
public class RecurringPaymentsController(RecurringPaymentService recurringPaymentService) : BaseController
{
    [HttpGet]
    public async Task<IActionResult> GetAll(Guid businessId, CancellationToken cancellationToken)
    {
        var result = await recurringPaymentService.GetAllAsync(businessId, CurrentUserId, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid businessId, Guid id, CancellationToken cancellationToken)
    {
        var result = await recurringPaymentService.GetByIdAsync(id, businessId, CurrentUserId, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        Guid businessId,
        [FromBody] CreateRecurringPaymentRequest request,
        CancellationToken cancellationToken)
    {
        var result = await recurringPaymentService.CreateAsync(businessId, CurrentUserId, request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { businessId, id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid businessId,
        Guid id,
        [FromBody] UpdateRecurringPaymentRequest request,
        CancellationToken cancellationToken)
    {
        var result = await recurringPaymentService.UpdateAsync(id, businessId, CurrentUserId, request, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid businessId, Guid id, CancellationToken cancellationToken)
    {
        await recurringPaymentService.DeleteAsync(id, businessId, CurrentUserId, cancellationToken);
        return NoContent();
    }
}
